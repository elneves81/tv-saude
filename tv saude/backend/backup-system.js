// Sistema de backup automático para TV Saúde
// Backup completo com versionamento e restauração

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');

class BackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = 30; // Manter 30 backups
    this.scheduledBackups = new Map();
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Backup completo do sistema
  async createFullBackup(description = 'Backup automático') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `tvsaude-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.zip`);

    try {
      console.log('🔄 Iniciando backup completo...');

      // Criar arquivo ZIP
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      // Adicionar banco de dados
      const dbPath = path.join(__dirname, 'database.db');
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'database.db' });
      }

      // Adicionar uploads
      const uploadsPath = path.join(__dirname, '../uploads');
      if (fs.existsSync(uploadsPath)) {
        archive.directory(uploadsPath, 'uploads');
      }

      // Adicionar imagens
      const imagesPath = path.join(__dirname, '../images');
      if (fs.existsSync(imagesPath)) {
        archive.directory(imagesPath, 'images');
      }

      // Adicionar configurações
      const configFiles = ['package.json', 'server.js', '.env'];
      configFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      });

      // Finalizar arquivo
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.finalize();
      });

      // Salvar metadados do backup
      const metadata = {
        filename: `${backupName}.zip`,
        created_at: new Date().toISOString(),
        description,
        size: fs.statSync(backupPath).size,
        type: 'full',
        files_count: archive.pointer()
      };

      db.run(`
        INSERT INTO backups (filename, created_at, description, size, type, files_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [metadata.filename, metadata.created_at, metadata.description, 
          metadata.size, metadata.type, metadata.files_count]);

      console.log(`✅ Backup criado com sucesso: ${backupPath}`);
      
      // Limpar backups antigos
      await this.cleanOldBackups();
      
      return metadata;

    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Backup apenas do banco de dados
  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `database-backup-${timestamp}.db`;
    const backupPath = path.join(this.backupDir, backupName);

    try {
      const dbPath = path.join(__dirname, 'database.db');
      
      // Copiar arquivo do banco
      fs.copyFileSync(dbPath, backupPath);

      const metadata = {
        filename: backupName,
        created_at: new Date().toISOString(),
        description: 'Backup do banco de dados',
        size: fs.statSync(backupPath).size,
        type: 'database',
        files_count: 1
      };

      db.run(`
        INSERT INTO backups (filename, created_at, description, size, type, files_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [metadata.filename, metadata.created_at, metadata.description, 
          metadata.size, metadata.type, metadata.files_count]);

      console.log(`✅ Backup do banco criado: ${backupPath}`);
      return metadata;

    } catch (error) {
      console.error('❌ Erro ao criar backup do banco:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreBackup(filename) {
    const backupPath = path.join(this.backupDir, filename);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Arquivo de backup não encontrado');
    }

    try {
      console.log(`🔄 Restaurando backup: ${filename}`);

      if (filename.endsWith('.zip')) {
        // Restaurar backup completo
        const extract = require('extract-zip');
        const tempDir = path.join(this.backupDir, 'temp-restore');
        
        // Extrair arquivo
        await extract(backupPath, { dir: tempDir });
        
        // Restaurar banco de dados
        const dbBackupPath = path.join(tempDir, 'database.db');
        if (fs.existsSync(dbBackupPath)) {
          const currentDbPath = path.join(__dirname, 'database.db');
          fs.copyFileSync(dbBackupPath, currentDbPath);
        }

        // Restaurar uploads
        const uploadsBackupPath = path.join(tempDir, 'uploads');
        if (fs.existsSync(uploadsBackupPath)) {
          const currentUploadsPath = path.join(__dirname, '../uploads');
          fs.rmSync(currentUploadsPath, { recursive: true, force: true });
          fs.cpSync(uploadsBackupPath, currentUploadsPath, { recursive: true });
        }

        // Restaurar imagens
        const imagesBackupPath = path.join(tempDir, 'images');
        if (fs.existsSync(imagesBackupPath)) {
          const currentImagesPath = path.join(__dirname, '../images');
          fs.rmSync(currentImagesPath, { recursive: true, force: true });
          fs.cpSync(imagesBackupPath, currentImagesPath, { recursive: true });
        }

        // Limpar diretório temporário
        fs.rmSync(tempDir, { recursive: true, force: true });

      } else if (filename.endsWith('.db')) {
        // Restaurar apenas banco de dados
        const currentDbPath = path.join(__dirname, 'database.db');
        fs.copyFileSync(backupPath, currentDbPath);
      }

      console.log(`✅ Backup restaurado com sucesso: ${filename}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Limpar backups antigos
  async cleanOldBackups() {
    try {
      const backups = await new Promise((resolve, reject) => {
        db.all(`
          SELECT filename FROM backups 
          ORDER BY created_at DESC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        
        for (const backup of toDelete) {
          const filePath = path.join(this.backupDir, backup.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          
          db.run('DELETE FROM backups WHERE filename = ?', [backup.filename]);
        }

        console.log(`🗑️ ${toDelete.length} backups antigos removidos`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar backups antigos:', error);
    }
  }

  // Agendar backups automáticos
  scheduleAutomaticBackups() {
    // Backup completo diário às 3:00
    const dailyBackup = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 3 && now.getMinutes() === 0) {
        this.createFullBackup('Backup automático diário');
      }
    }, 60000); // Verificar a cada minuto

    // Backup do banco a cada 4 horas
    const dbBackup = setInterval(() => {
      this.createDatabaseBackup();
    }, 4 * 60 * 60 * 1000); // 4 horas

    this.scheduledBackups.set('daily', dailyBackup);
    this.scheduledBackups.set('database', dbBackup);

    console.log('📅 Backups automáticos agendados');
  }

  // Parar backups automáticos
  stopAutomaticBackups() {
    this.scheduledBackups.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`⏹️ Backup automático ${name} parado`);
    });
    this.scheduledBackups.clear();
  }

  // Listar backups disponíveis
  async listBackups() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM backups 
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Verificar integridade do backup
  async verifyBackup(filename) {
    const backupPath = path.join(this.backupDir, filename);
    
    if (!fs.existsSync(backupPath)) {
      return { valid: false, error: 'Arquivo não encontrado' };
    }

    try {
      const stats = fs.statSync(backupPath);
      
      if (stats.size === 0) {
        return { valid: false, error: 'Arquivo vazio' };
      }

      if (filename.endsWith('.zip')) {
        // Verificar integridade do ZIP
        const JSZip = require('jszip');
        const data = fs.readFileSync(backupPath);
        await JSZip.loadAsync(data);
      }

      return { valid: true, size: stats.size };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = BackupSystem;
