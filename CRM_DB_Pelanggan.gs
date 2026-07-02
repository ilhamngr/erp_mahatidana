/**
 * Backend Modul: CRM (Customer Relationship Management)
 * File: CRM_DB_Pelanggan.gs
 * Peran: Menangani operasi CRUD untuk data master pelanggan (Termasuk NPWP).
 */

/**
 * Mengambil semua data pelanggan beserta NPWP (Read)
 */
function crm_getPelanggan() {
  let conn = null;
  let stmt = null;
  let rs = null;
  let results = [];
  
  try {
    conn = getGlobalConnection(); 
    stmt = conn.createStatement();

    // BARIS SAKTI 1: Tarik data per blok (efisiensi memori)
    stmt.setFetchSize(1000);
    
    // PERBAIKAN: Tambahkan LIMIT 100 di akhir query agar server tidak timeout!
    let sql = 'SELECT id, nama_perusahaan, kontak_person, email, telepon, alamat, npwp FROM master_pelanggan ORDER BY id DESC LIMIT 100';
    rs = stmt.executeQuery(sql);
    
    while (rs.next()) {
      results.push({
        id: rs.getInt(1),
        nama_perusahaan: rs.getString(2),
        kontak_person: rs.getString(3),
        email: rs.getString(4),
        telepon: rs.getString(5),
        alamat: rs.getString(6),
        npwp: rs.getString(7)
      });
    }
    return results;
  } catch (e) {
    Logger.log("Error di crm_getPelanggan: " + e.message);
    throw new Error("Gagal memuat data pelanggan: " + e.message);
  } finally {
    if (rs) rs.close();
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Menyimpan data pelanggan baru beserta NPWP (Create)
 */
function crm_addPelanggan(data) {
  let conn = null;
  let stmt = null;
  
  try {
    conn = getGlobalConnection(); 
    
    // UPDATE: Menambahkan kolom npwp dan parameter (?) ke dalam query INSERT
    let sql = "INSERT INTO master_pelanggan (nama_perusahaan, kontak_person, email, telepon, alamat, npwp) VALUES (?, ?, ?, ?, ?, ?)";
    stmt = conn.prepareStatement(sql);
    
    stmt.setString(1, data.nama_perusahaan);
    stmt.setString(2, data.kontak_person);
    stmt.setString(3, data.email);
    stmt.setString(4, data.telepon);
    stmt.setString(5, data.alamat);
    stmt.setString(6, data.npwp); // Bind parameter NPWP
    
    stmt.execute();
    return { success: true, message: "Data pelanggan berhasil disimpan." };
  } catch (e) {
    Logger.log("Error di crm_addPelanggan: " + e.message);
    return { success: false, message: e.message };
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Memperbarui data pelanggan (Update)
 */
function crm_updatePelanggan(data) {
  let conn = null;
  let stmt = null;
  
  try {
    conn = getGlobalConnection();
    let sql = "UPDATE master_pelanggan SET nama_perusahaan = ?, npwp = ?, kontak_person = ?, email = ?, telepon = ?, alamat = ? WHERE id = ?";
    stmt = conn.prepareStatement(sql);
    
    stmt.setString(1, data.nama_perusahaan);
    stmt.setString(2, data.npwp);
    stmt.setString(3, data.kontak_person);
    stmt.setString(4, data.email);
    stmt.setString(5, data.telepon);
    stmt.setString(6, data.alamat);
    stmt.setInt(7, data.id); // Mencari berdasarkan ID pelanggan
    
    stmt.execute();
    return { success: true, message: "Data pelanggan berhasil diperbarui." };
  } catch (e) {
    Logger.log("Error di crm_updatePelanggan: " + e.message);
    return { success: false, message: e.message };
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Menghapus data pelanggan (Delete)
 */
function crm_deletePelanggan(id) {
  let conn = null;
  let stmt = null;
  
  try {
    conn = getGlobalConnection();
    let sql = "DELETE FROM master_pelanggan WHERE id = ?";
    stmt = conn.prepareStatement(sql);
    stmt.setInt(1, id);
    
    stmt.execute();
    return { success: true, message: "Data pelanggan berhasil dihapus." };
  } catch (e) {
    Logger.log("Error di crm_deletePelanggan: " + e.message);
    return { success: false, message: e.message };
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Mencari data pelanggan berdasarkan kata kunci (Server-Side Search)
 * Sangat ringan karena menggunakan LIMIT 20 dan ILIKE (Case Insensitive)
 */
function crm_searchPelanggan(keyword) {
  let conn = null;
  let stmt = null;
  let rs = null;
  let results = [];
  
  // Keamanan ekstra: Jangan cari jika keyword kosong atau kurang dari 2 huruf
  if (!keyword || keyword.trim().length < 2) return []; 

  try {
    conn = getGlobalConnection();
    
    // Gunakan ILIKE bawaan PostgreSQL Supabase untuk pencarian teks dinamis
    let sql = "SELECT id, nama_perusahaan FROM master_pelanggan WHERE nama_perusahaan ILIKE ? LIMIT 20";
    stmt = conn.prepareStatement(sql);
    stmt.setString(1, "%" + keyword.trim() + "%");
    rs = stmt.executeQuery();
    
    while (rs.next()) {
      results.push({
        id: rs.getInt(1),
        nama_perusahaan: rs.getString(2)
      });
    }
    return results;
  } catch(e) {
    throw new Error("Gagal mencari pelanggan: " + e.message);
  } finally {
    if(rs) rs.close(); 
    if(stmt) stmt.close(); 
    if(conn) conn.close();
  }
}
