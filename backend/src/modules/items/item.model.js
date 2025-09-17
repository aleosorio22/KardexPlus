const db = require('../../core/config/database');

class ItemModel {
    /**
     * Crea un nuevo item en la base de datos
     * @param {Object} itemData - Datos del item
     * @returns {Promise<number>} - ID del item creado
     */
    static async create(itemData) {
        const {
            Item_Codigo_SKU,
            Item_Codigo_Barra,
            Item_Nombre,
            Item_Costo_Unitario,
            Item_Estado,
            CategoriaItem_Id,
            UnidadMedidaBase_Id
        } = itemData;

        // Verificar duplicados
        if (Item_Nombre && await this.existsByName(Item_Nombre)) {
            throw new Error('Ya existe un item con ese nombre');
        }

        if (Item_Codigo_SKU && await this.existsBySKU(Item_Codigo_SKU)) {
            throw new Error('Ya existe un item con ese código SKU');
        }

        if (Item_Codigo_Barra && await this.existsByBarcode(Item_Codigo_Barra)) {
            throw new Error('Ya existe un item con ese código de barras');
        }

        const [result] = await db.execute(`
            INSERT INTO Items (
                Item_Codigo_SKU,
                Item_Codigo_Barra,
                Item_Nombre,
                Item_Costo_Unitario,
                Item_Estado,
                CategoriaItem_Id,
                UnidadMedidaBase_Id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            Item_Codigo_SKU || null,
            Item_Codigo_Barra || null,
            Item_Nombre,
            Item_Costo_Unitario,
            Item_Estado !== undefined ? Item_Estado : true,
            CategoriaItem_Id,
            UnidadMedidaBase_Id
        ]);
        
        return result.insertId;
    }

    /**
     * Obtiene todos los items
     * @returns {Promise<Array>} - Array de items
     */
    static async findAll() {
        const [items] = await db.execute(`
            SELECT 
                i.Item_Id,
                i.Item_Codigo_SKU,
                i.Item_Codigo_Barra,
                i.Item_Nombre,
                i.Item_Costo_Unitario,
                i.Item_Estado,
                i.CategoriaItem_Id,
                i.UnidadMedidaBase_Id,
                c.CategoriaItem_Nombre,
                c.CategoriaItem_Descripcion,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo
            FROM Items i
            INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
            INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id
            ORDER BY i.Item_Nombre ASC
        `);
        return items;
    }

    /**
     * Busca un item por ID
     * @param {number} id - ID del item
     * @returns {Promise<Object|undefined>} - Item encontrado o undefined
     */
    static async findById(id) {
        const [items] = await db.execute(`
            SELECT 
                i.Item_Id,
                i.Item_Codigo_SKU,
                i.Item_Codigo_Barra,
                i.Item_Nombre,
                i.Item_Costo_Unitario,
                i.Item_Estado,
                i.CategoriaItem_Id,
                i.UnidadMedidaBase_Id,
                c.CategoriaItem_Nombre,
                c.CategoriaItem_Descripcion,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo
            FROM Items i
            INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
            INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id
            WHERE i.Item_Id = ?
        `, [id]);
        return items[0];
    }

    /**
     * Actualiza un item
     * @param {number} id - ID del item
     * @param {Object} itemData - Datos actualizados del item
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async update(id, itemData) {
        const {
            Item_Codigo_SKU,
            Item_Codigo_Barra,
            Item_Nombre,
            Item_Costo_Unitario,
            Item_Estado,
            CategoriaItem_Id,
            UnidadMedidaBase_Id
        } = itemData;

        // Verificar duplicados (excluyendo el item actual)
        if (Item_Nombre && await this.existsByName(Item_Nombre, id)) {
            throw new Error('Ya existe otro item con ese nombre');
        }

        if (Item_Codigo_SKU && await this.existsBySKU(Item_Codigo_SKU, id)) {
            throw new Error('Ya existe otro item con ese código SKU');
        }

        if (Item_Codigo_Barra && await this.existsByBarcode(Item_Codigo_Barra, id)) {
            throw new Error('Ya existe otro item con ese código de barras');
        }

        const [result] = await db.execute(`
            UPDATE Items SET
                Item_Codigo_SKU = ?,
                Item_Codigo_Barra = ?,
                Item_Nombre = ?,
                Item_Costo_Unitario = ?,
                Item_Estado = ?,
                CategoriaItem_Id = ?,
                UnidadMedidaBase_Id = ?
            WHERE Item_Id = ?
        `, [
            Item_Codigo_SKU || null,
            Item_Codigo_Barra || null,
            Item_Nombre,
            Item_Costo_Unitario,
            Item_Estado !== undefined ? Item_Estado : true,
            CategoriaItem_Id,
            UnidadMedidaBase_Id,
            id
        ]);
        
        return result.affectedRows > 0;
    }

    /**
     * Elimina un item (cambio de estado en lugar de eliminación física)
     * @param {number} id - ID del item
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async delete(id) {
        // En lugar de eliminar físicamente, cambiar estado a false
        const [result] = await db.execute(
            'UPDATE Items SET Item_Estado = false WHERE Item_Id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Restaura un item (cambio de estado a activo)
     * @param {number} id - ID del item
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async restore(id) {
        const [result] = await db.execute(
            'UPDATE Items SET Item_Estado = true WHERE Item_Id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Toggle del estado de un item
     * @param {number} id - ID del item
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async toggleStatus(id) {
        const [result] = await db.execute(
            'UPDATE Items SET Item_Estado = NOT Item_Estado WHERE Item_Id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Busca items con paginación
     * @param {number} offset - Número de registros a saltar
     * @param {number} limit - Número máximo de registros a retornar
     * @param {string} search - Término de búsqueda (opcional)
     * @param {string} categoria - ID de categoría para filtrar (opcional)
     * @param {string} estado - Estado para filtrar (opcional)
     * @returns {Promise<Object>} - Objeto con data y total
     */
    static async findWithPagination(offset = 0, limit = 10, search = '', categoria = '', estado = '') {
        let query = `
            SELECT 
                i.Item_Id,
                i.Item_Codigo_SKU,
                i.Item_Codigo_Barra,
                i.Item_Nombre,
                i.Item_Costo_Unitario,
                i.Item_Estado,
                i.CategoriaItem_Id,
                i.UnidadMedidaBase_Id,
                c.CategoriaItem_Nombre,
                c.CategoriaItem_Descripcion,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo
            FROM Items i
            INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
            INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM Items i INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id';
        let params = [];
        let whereConditions = [];

        if (search && search.trim() !== '') {
            const searchPattern = `%${search.trim()}%`;
            whereConditions.push('(i.Item_Nombre LIKE ? OR i.Item_Codigo_SKU LIKE ? OR i.Item_Codigo_Barra LIKE ?)');
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (categoria && categoria.trim() !== '') {
            whereConditions.push('i.CategoriaItem_Id = ?');
            params.push(parseInt(categoria));
        }

        if (estado && estado.trim() !== '') {
            whereConditions.push('i.Item_Estado = ?');
            const estadoBool = estado === 'true' || estado === '1';
            params.push(estadoBool);
        }

        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY i.Item_Nombre ASC LIMIT ? OFFSET ?';
        
        // Para la consulta principal, agregamos limit y offset
        const queryParams = [...params, parseInt(limit), parseInt(offset)];
        
        // Para la consulta de conteo, solo usamos los parámetros de filtro
        const countParams = [...params];

        const [items] = await db.execute(query, queryParams);
        const [countResult] = await db.execute(countQuery, countParams);

        return {
            data: items,
            total: countResult[0].total
        };
    }

    /**
     * Obtiene items por categoría
     * @param {number} categoriaId - ID de la categoría
     * @returns {Promise<Array>} - Array de items
     */
    static async findByCategory(categoriaId) {
        const [items] = await db.execute(`
            SELECT 
                i.Item_Id,
                i.Item_Codigo_SKU,
                i.Item_Codigo_Barra,
                i.Item_Nombre,
                i.Item_Costo_Unitario,
                i.Item_Estado,
                i.CategoriaItem_Id,
                i.UnidadMedidaBase_Id,
                c.CategoriaItem_Nombre,
                c.CategoriaItem_Descripcion,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo
            FROM Items i
            INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
            INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id
            WHERE i.CategoriaItem_Id = ?
            ORDER BY i.Item_Nombre ASC
        `, [categoriaId]);
        return items;
    }

    /**
     * Busca items por término
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} - Array de items encontrados
     */
    static async search(searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        const [items] = await db.execute(`
            SELECT 
                i.Item_Id,
                i.Item_Codigo_SKU,
                i.Item_Codigo_Barra,
                i.Item_Nombre,
                i.Item_Costo_Unitario,
                i.Item_Estado,
                i.CategoriaItem_Id,
                i.UnidadMedidaBase_Id,
                c.CategoriaItem_Nombre,
                c.CategoriaItem_Descripcion,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo
            FROM Items i
            INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
            INNER JOIN UnidadesMedida u ON i.UnidadMedidaBase_Id = u.UnidadMedida_Id
            WHERE i.Item_Nombre LIKE ? 
               OR i.Item_Codigo_SKU LIKE ? 
               OR i.Item_Codigo_Barra LIKE ?
               OR c.CategoriaItem_Nombre LIKE ?
            ORDER BY i.Item_Nombre ASC
        `, [searchPattern, searchPattern, searchPattern, searchPattern]);
        return items;
    }

    /**
     * Cuenta el número total de items
     * @returns {Promise<number>} - Número total de items
     */
    static async count() {
        const [result] = await db.execute('SELECT COUNT(*) as total FROM Items');
        return result[0].total;
    }

    /**
     * Verifica si un item existe
     * @param {number} id - ID del item
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async exists(id) {
        const [items] = await db.execute(
            'SELECT Item_Id FROM Items WHERE Item_Id = ?',
            [id]
        );
        return items.length > 0;
    }

    /**
     * Verifica si existe un item con el nombre dado
     * @param {string} nombre - Nombre del item
     * @param {number} excludeId - ID a excluir de la búsqueda (opcional)
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async existsByName(nombre, excludeId = null) {
        let query = 'SELECT Item_Id FROM Items WHERE Item_Nombre = ?';
        let params = [nombre];
        
        if (excludeId) {
            query += ' AND Item_Id != ?';
            params.push(excludeId);
        }
        
        const [items] = await db.execute(query, params);
        return items.length > 0;
    }

    /**
     * Verifica si existe un item con el código SKU dado
     * @param {string} sku - Código SKU
     * @param {number} excludeId - ID a excluir de la búsqueda (opcional)
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async existsBySKU(sku, excludeId = null) {
        let query = 'SELECT Item_Id FROM Items WHERE Item_Codigo_SKU = ?';
        let params = [sku];
        
        if (excludeId) {
            query += ' AND Item_Id != ?';
            params.push(excludeId);
        }
        
        const [items] = await db.execute(query, params);
        return items.length > 0;
    }

    /**
     * Verifica si existe un item con el código de barras dado
     * @param {string} barcode - Código de barras
     * @param {number} excludeId - ID a excluir de la búsqueda (opcional)
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async existsByBarcode(barcode, excludeId = null) {
        let query = 'SELECT Item_Id FROM Items WHERE Item_Codigo_Barra = ?';
        let params = [barcode];
        
        if (excludeId) {
            query += ' AND Item_Id != ?';
            params.push(excludeId);
        }
        
        const [items] = await db.execute(query, params);
        return items.length > 0;
    }
}

module.exports = ItemModel;
