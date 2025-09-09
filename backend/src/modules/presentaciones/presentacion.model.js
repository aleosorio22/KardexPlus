const db = require('../../core/config/database');

class PresentacionModel {
  // Obtener todas las presentaciones con información de la unidad de medida
  static async findAll() {
    const query = `
      SELECT 
        p.Presentacion_Id,
        p.Presentacion_Nombre,
        p.Presentacion_Cantidad,
        p.UnidadMedida_Id,
        um.UnidadMedida_Nombre,
        um.UnidadMedida_Prefijo
      FROM Presentaciones p
      INNER JOIN UnidadesMedida um ON p.UnidadMedida_Id = um.UnidadMedida_Id
      ORDER BY p.Presentacion_Nombre ASC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener presentaciones: ${error.message}`);
    }
  }

  // Obtener una presentación por ID con información de la unidad de medida
  static async findById(id) {
    const query = `
      SELECT 
        p.Presentacion_Id,
        p.Presentacion_Nombre,
        p.Presentacion_Cantidad,
        p.UnidadMedida_Id,
        um.UnidadMedida_Nombre,
        um.UnidadMedida_Prefijo
      FROM Presentaciones p
      INNER JOIN UnidadesMedida um ON p.UnidadMedida_Id = um.UnidadMedida_Id
      WHERE p.Presentacion_Id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener presentación: ${error.message}`);
    }
  }

  // Obtener presentaciones por unidad de medida
  static async findByUnidadMedida(unidadMedidaId) {
    const query = `
      SELECT 
        p.Presentacion_Id,
        p.Presentacion_Nombre,
        p.Presentacion_Cantidad,
        p.UnidadMedida_Id,
        um.UnidadMedida_Nombre,
        um.UnidadMedida_Prefijo
      FROM Presentaciones p
      INNER JOIN UnidadesMedida um ON p.UnidadMedida_Id = um.UnidadMedida_Id
      WHERE p.UnidadMedida_Id = ?
      ORDER BY p.Presentacion_Cantidad DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [unidadMedidaId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener presentaciones por unidad de medida: ${error.message}`);
    }
  }

  // Crear nueva presentación
  static async create(presentacionData) {
    const { Presentacion_Nombre, Presentacion_Cantidad, UnidadMedida_Id } = presentacionData;
    
    // Validaciones
    if (!Presentacion_Nombre || Presentacion_Nombre.trim() === '') {
      throw new Error('El nombre de la presentación es requerido');
    }
    
    if (!Presentacion_Cantidad || Presentacion_Cantidad <= 0) {
      throw new Error('La cantidad debe ser un número positivo');
    }
    
    if (!UnidadMedida_Id) {
      throw new Error('La unidad de medida es requerida');
    }

    // Verificar que la unidad de medida existe
    const unidadQuery = 'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Id = ?';
    const [unidadRows] = await db.execute(unidadQuery, [UnidadMedida_Id]);
    
    if (unidadRows.length === 0) {
      throw new Error('La unidad de medida especificada no existe');
    }

    // Verificar que no existe una presentación con el mismo nombre
    const checkQuery = 'SELECT Presentacion_Id FROM Presentaciones WHERE Presentacion_Nombre = ?';
    const [existingRows] = await db.execute(checkQuery, [Presentacion_Nombre.trim()]);
    
    if (existingRows.length > 0) {
      throw new Error('Ya existe una presentación con este nombre');
    }

    const insertQuery = `
      INSERT INTO Presentaciones (Presentacion_Nombre, Presentacion_Cantidad, UnidadMedida_Id)
      VALUES (?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(insertQuery, [
        Presentacion_Nombre.trim(),
        Presentacion_Cantidad,
        UnidadMedida_Id
      ]);
      
      return this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe una presentación con este nombre');
      }
      throw new Error(`Error al crear presentación: ${error.message}`);
    }
  }

  // Actualizar presentación
  static async update(id, presentacionData) {
    const { Presentacion_Nombre, Presentacion_Cantidad, UnidadMedida_Id } = presentacionData;
    
    // Validaciones
    if (!Presentacion_Nombre || Presentacion_Nombre.trim() === '') {
      throw new Error('El nombre de la presentación es requerido');
    }
    
    if (!Presentacion_Cantidad || Presentacion_Cantidad <= 0) {
      throw new Error('La cantidad debe ser un número positivo');
    }
    
    if (!UnidadMedida_Id) {
      throw new Error('La unidad de medida es requerida');
    }

    // Verificar que la presentación existe
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Presentación no encontrada');
    }

    // Verificar que la unidad de medida existe
    const unidadQuery = 'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Id = ?';
    const [unidadRows] = await db.execute(unidadQuery, [UnidadMedida_Id]);
    
    if (unidadRows.length === 0) {
      throw new Error('La unidad de medida especificada no existe');
    }

    // Verificar que no existe otra presentación con el mismo nombre
    const checkQuery = 'SELECT Presentacion_Id FROM Presentaciones WHERE Presentacion_Nombre = ? AND Presentacion_Id != ?';
    const [existingRows] = await db.execute(checkQuery, [Presentacion_Nombre.trim(), id]);
    
    if (existingRows.length > 0) {
      throw new Error('Ya existe otra presentación con este nombre');
    }

    const updateQuery = `
      UPDATE Presentaciones 
      SET Presentacion_Nombre = ?, Presentacion_Cantidad = ?, UnidadMedida_Id = ?
      WHERE Presentacion_Id = ?
    `;
    
    try {
      await db.execute(updateQuery, [
        Presentacion_Nombre.trim(),
        Presentacion_Cantidad,
        UnidadMedida_Id,
        id
      ]);
      
      return this.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe otra presentación con este nombre');
      }
      throw new Error(`Error al actualizar presentación: ${error.message}`);
    }
  }

  // Eliminar presentación
  static async delete(id) {
    // Verificar que la presentación existe
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Presentación no encontrada');
    }

    // Verificar que no hay items asociados a esta presentación
    const itemsQuery = 'SELECT COUNT(*) as count FROM Items_Presentaciones WHERE Presentacion_Id = ?';
    const [itemsRows] = await db.execute(itemsQuery, [id]);
    
    if (itemsRows[0].count > 0) {
      throw new Error('No se puede eliminar la presentación porque tiene items asociados');
    }

    const deleteQuery = 'DELETE FROM Presentaciones WHERE Presentacion_Id = ?';
    
    try {
      const [result] = await db.execute(deleteQuery, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('No se pudo eliminar la presentación');
      }
      
      return { message: 'Presentación eliminada exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar presentación: ${error.message}`);
    }
  }

  // Obtener estadísticas de presentaciones
  static async getStats() {
    const queries = [
      'SELECT COUNT(*) as totalPresentaciones FROM Presentaciones',
      `SELECT 
         COUNT(DISTINCT UnidadMedida_Id) as unidadesMedidaUsadas 
       FROM Presentaciones`,
      `SELECT 
         um.UnidadMedida_Nombre, 
         COUNT(p.Presentacion_Id) as cantidad
       FROM UnidadesMedida um
       LEFT JOIN Presentaciones p ON um.UnidadMedida_Id = p.UnidadMedida_Id
       GROUP BY um.UnidadMedida_Id, um.UnidadMedida_Nombre
       ORDER BY cantidad DESC
       LIMIT 5`,
      `SELECT 
         COUNT(*) as itemsConPresentaciones 
       FROM Items_Presentaciones`
    ];

    try {
      const [
        [totalRows],
        [unidadesRows],
        distribuncionRows,
        [itemsRows]
      ] = await Promise.all(queries.map(query => db.execute(query)));

      return {
        totalPresentaciones: totalRows[0].totalPresentaciones,
        unidadesMedidaUsadas: unidadesRows[0].unidadesMedidaUsadas,
        distribuncionPorUnidad: distribuncionRows[0],
        itemsConPresentaciones: itemsRows[0].itemsConPresentaciones
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Buscar presentaciones
  static async search(searchTerm) {
    const query = `
      SELECT 
        p.Presentacion_Id,
        p.Presentacion_Nombre,
        p.Presentacion_Cantidad,
        p.UnidadMedida_Id,
        um.UnidadMedida_Nombre,
        um.UnidadMedida_Prefijo
      FROM Presentaciones p
      INNER JOIN UnidadesMedida um ON p.UnidadMedida_Id = um.UnidadMedida_Id
      WHERE p.Presentacion_Nombre LIKE ? 
         OR um.UnidadMedida_Nombre LIKE ?
         OR um.UnidadMedida_Prefijo LIKE ?
      ORDER BY p.Presentacion_Nombre ASC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    try {
      const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar presentaciones: ${error.message}`);
    }
  }
}

module.exports = PresentacionModel;
