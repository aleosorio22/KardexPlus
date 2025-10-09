const STORAGE_KEYS = {
  INCIDENCIAS: 'kardex_incidencias',
  CONFIGURACION: 'kardex_incidencias_config'
};

class IncidenciaService {
  
  // =======================================
  // CONFIGURACIÓN Y CATEGORÍAS
  // =======================================
  
  static getCategorias() {
    return [
      {
        id: 'alimentos',
        nombre: 'Alimentos y Bebidas',
        subcategorias: [
          { id: 'deterioro_alimento', nombre: 'Deterioro de alimento', color: 'red' },
          { id: 'contaminacion', nombre: 'Contaminación cruzada', color: 'red' },
          { id: 'vencimiento', nombre: 'Producto vencido', color: 'orange' },
          { id: 'calidad_bebida', nombre: 'Calidad de bebida', color: 'yellow' },
          { id: 'temperatura', nombre: 'Problema de temperatura', color: 'blue' },
          { id: 'almacenamiento', nombre: 'Error de almacenamiento', color: 'purple' }
        ]
      },
      {
        id: 'equipos',
        nombre: 'Equipos y Maquinaria',
        subcategorias: [
          { id: 'cocina', nombre: 'Equipo de cocina', color: 'red' },
          { id: 'refrigeracion', nombre: 'Sistema de refrigeración', color: 'blue' },
          { id: 'pos_caja', nombre: 'POS/Sistema de caja', color: 'green' },
          { id: 'audio_video', nombre: 'Audio y video', color: 'purple' },
          { id: 'limpieza', nombre: 'Equipo de limpieza', color: 'cyan' },
          { id: 'mobiliario', nombre: 'Mobiliario', color: 'gray' }
        ]
      },
      {
        id: 'personal',
        nombre: 'Personal y Recursos Humanos',
        subcategorias: [
          { id: 'ausencia', nombre: 'Ausencia no programada', color: 'orange' },
          { id: 'accidente', nombre: 'Accidente laboral', color: 'red' },
          { id: 'conflicto', nombre: 'Conflicto entre personal', color: 'yellow' },
          { id: 'capacitacion', nombre: 'Falta de capacitación', color: 'blue' },
          { id: 'uniforme', nombre: 'Problema con uniforme/EPP', color: 'gray' },
          { id: 'productividad', nombre: 'Problema de productividad', color: 'purple' }
        ]
      },
      {
        id: 'infraestructura',
        nombre: 'Infraestructura y Facilities',
        subcategorias: [
          { id: 'plomeria', nombre: 'Plomería', color: 'blue' },
          { id: 'electricidad', nombre: 'Sistema eléctrico', color: 'yellow' },
          { id: 'ventilacion', nombre: 'Ventilación/Climatización', color: 'cyan' },
          { id: 'estructura', nombre: 'Daño estructural', color: 'red' },
          { id: 'limpieza_area', nombre: 'Área no limpia', color: 'orange' },
          { id: 'seguridad', nombre: 'Problema de seguridad', color: 'red' }
        ]
      },
      {
        id: 'clientes',
        nombre: 'Atención al Cliente',
        subcategorias: [
          { id: 'queja_servicio', nombre: 'Queja de servicio', color: 'orange' },
          { id: 'queja_comida', nombre: 'Queja de comida', color: 'red' },
          { id: 'tiempo_espera', nombre: 'Tiempo de espera', color: 'yellow' },
          { id: 'error_pedido', nombre: 'Error en pedido', color: 'purple' },
          { id: 'incidente_cliente', nombre: 'Incidente con cliente', color: 'red' },
          { id: 'sugerencia', nombre: 'Sugerencia de mejora', color: 'green' }
        ]
      },
      {
        id: 'operaciones',
        nombre: 'Operaciones y Procesos',
        subcategorias: [
          { id: 'procedimiento', nombre: 'Error en procedimiento', color: 'orange' },
          { id: 'inventario', nombre: 'Problema de inventario', color: 'blue' },
          { id: 'proveedor', nombre: 'Problema con proveedor', color: 'purple' },
          { id: 'calidad', nombre: 'Control de calidad', color: 'red' },
          { id: 'delivery', nombre: 'Problema de delivery', color: 'yellow' },
          { id: 'sistema', nombre: 'Falla de sistema', color: 'gray' }
        ]
      }
    ];
  }

  static getPrioridades() {
    return [
      { id: 'critica', nombre: 'Crítica', color: 'red', descripcion: 'Requiere atención inmediata' },
      { id: 'alta', nombre: 'Alta', color: 'orange', descripcion: 'Resolver dentro de 2 horas' },
      { id: 'media', nombre: 'Media', color: 'yellow', descripcion: 'Resolver dentro del día' },
      { id: 'baja', nombre: 'Baja', color: 'green', descripcion: 'Resolver cuando sea posible' }
    ];
  }

  static getEstados() {
    return [
      { id: 'abierta', nombre: 'Abierta', color: 'red' },
      { id: 'en_progreso', nombre: 'En Progreso', color: 'blue' },
      { id: 'esperando', nombre: 'Esperando Respuesta', color: 'yellow' },
      { id: 'resuelta', nombre: 'Resuelta', color: 'green' },
      { id: 'cerrada', nombre: 'Cerrada', color: 'gray' }
    ];
  }

  // =======================================
  // GESTIÓN DE INCIDENCIAS
  // =======================================

  static getAllIncidencias() {
    try {
      const incidencias = localStorage.getItem(STORAGE_KEYS.INCIDENCIAS);
      return incidencias ? JSON.parse(incidencias) : [];
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      return [];
    }
  }

  static getIncidenciaById(id) {
    const incidencias = this.getAllIncidencias();
    return incidencias.find(inc => inc.id === id);
  }

  static saveIncidencia(incidenciaData) {
    try {
      const incidencias = this.getAllIncidencias();
      
      // Generar ID único
      const nuevoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const nuevaIncidencia = {
        id: nuevoId,
        titulo: incidenciaData.titulo,
        descripcion: incidenciaData.descripcion,
        categoria: incidenciaData.categoria,
        subcategoria: incidenciaData.subcategoria,
        prioridad: incidenciaData.prioridad,
        estado: 'abierta',
        ubicacion: incidenciaData.ubicacion || '',
        equipoAfectado: incidenciaData.equipoAfectado || '',
        personaReporta: incidenciaData.personaReporta || 'Usuario Actual',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        fotos: incidenciaData.fotos || [],
        comentarios: [
          {
            id: 1,
            texto: 'Incidencia creada',
            autor: incidenciaData.personaReporta || 'Usuario Actual',
            fecha: new Date().toISOString(),
            tipo: 'sistema'
          }
        ],
        tiempoResolucion: null,
        costoEstimado: incidenciaData.costoEstimado || null,
        responsableAsignado: incidenciaData.responsableAsignado || null
      };

      incidencias.unshift(nuevaIncidencia); // Agregar al inicio
      localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(incidencias));
      
      return nuevaIncidencia;
    } catch (error) {
      console.error('Error al guardar incidencia:', error);
      throw new Error('No se pudo guardar la incidencia');
    }
  }

  static updateIncidencia(id, updateData) {
    try {
      const incidencias = this.getAllIncidencias();
      const index = incidencias.findIndex(inc => inc.id === id);
      
      if (index === -1) {
        throw new Error('Incidencia no encontrada');
      }

      // Actualizar los datos
      incidencias[index] = {
        ...incidencias[index],
        ...updateData,
        fechaActualizacion: new Date().toISOString()
      };

      // Si se cambió el estado, agregar comentario
      if (updateData.estado && updateData.estado !== incidencias[index].estado) {
        const nuevoComentario = {
          id: Date.now(),
          texto: `Estado cambiado a: ${this.getEstados().find(e => e.id === updateData.estado)?.nombre}`,
          autor: updateData.usuarioActual || 'Sistema',
          fecha: new Date().toISOString(),
          tipo: 'cambio_estado'
        };
        incidencias[index].comentarios.push(nuevoComentario);
      }

      localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(incidencias));
      return incidencias[index];
    } catch (error) {
      console.error('Error al actualizar incidencia:', error);
      throw error;
    }
  }

  static deleteIncidencia(id) {
    try {
      const incidencias = this.getAllIncidencias();
      const incidenciasFiltradas = incidencias.filter(inc => inc.id !== id);
      localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(incidenciasFiltradas));
      return true;
    } catch (error) {
      console.error('Error al eliminar incidencia:', error);
      throw new Error('No se pudo eliminar la incidencia');
    }
  }

  static addComentario(incidenciaId, comentario, autor) {
    try {
      const incidencias = this.getAllIncidencias();
      const index = incidencias.findIndex(inc => inc.id === incidenciaId);
      
      if (index === -1) {
        throw new Error('Incidencia no encontrada');
      }

      const nuevoComentario = {
        id: Date.now(),
        texto: comentario,
        autor: autor || 'Usuario Actual',
        fecha: new Date().toISOString(),
        tipo: 'comentario'
      };

      incidencias[index].comentarios.push(nuevoComentario);
      incidencias[index].fechaActualizacion = new Date().toISOString();

      localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(incidencias));
      return nuevoComentario;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  }

  // =======================================
  // GESTIÓN DE FOTOS
  // =======================================

  static async processImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No se proporcionó archivo'));
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('La imagen no puede ser mayor a 5MB'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar si es muy grande
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxWidth = 1200;
          const maxHeight = 1200;
          
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con calidad optimizada
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          resolve({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            dataUrl,
            nombre: file.name,
            tamaño: dataUrl.length,
            fechaSubida: new Date().toISOString()
          });
        };
        
        img.onerror = () => reject(new Error('Error al procesar la imagen'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  // =======================================
  // ESTADÍSTICAS Y REPORTES
  // =======================================

  static getEstadisticas() {
    const incidencias = this.getAllIncidencias();
    const categorias = this.getCategorias();
    const estados = this.getEstados();
    const prioridades = this.getPrioridades();

    // Estadísticas generales
    const total = incidencias.length;
    const abiertas = incidencias.filter(inc => inc.estado === 'abierta').length;
    const enProgreso = incidencias.filter(inc => inc.estado === 'en_progreso').length;
    const resueltas = incidencias.filter(inc => inc.estado === 'resuelta').length;

    // Por categoría
    const porCategoria = categorias.map(cat => ({
      categoria: cat.nombre,
      cantidad: incidencias.filter(inc => inc.categoria === cat.id).length
    }));

    // Por prioridad
    const porPrioridad = prioridades.map(prior => ({
      prioridad: prior.nombre,
      color: prior.color,
      cantidad: incidencias.filter(inc => inc.prioridad === prior.id).length
    }));

    // Incidencias de hoy
    const hoy = new Date().toDateString();
    const incidenciasHoy = incidencias.filter(inc => 
      new Date(inc.fechaCreacion).toDateString() === hoy
    ).length;

    // Tiempo promedio de resolución
    const resolucionesCompletas = incidencias.filter(inc => 
      inc.estado === 'resuelta' && inc.tiempoResolucion
    );
    
    const tiempoPromedioResolucion = resolucionesCompletas.length > 0
      ? resolucionesCompletas.reduce((acc, inc) => acc + inc.tiempoResolucion, 0) / resolucionesCompletas.length
      : 0;

    return {
      general: {
        total,
        abiertas,
        enProgreso,
        resueltas,
        incidenciasHoy,
        tiempoPromedioResolucion: Math.round(tiempoPromedioResolucion / (1000 * 60 * 60)) // en horas
      },
      porCategoria,
      porPrioridad,
      tendencias: this.getTendencias()
    };
  }

  static getTendencias() {
    const incidencias = this.getAllIncidencias();
    const ultimos7Dias = [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toDateString();
      
      const incidenciasDia = incidencias.filter(inc => 
        new Date(inc.fechaCreacion).toDateString() === fechaStr
      ).length;
      
      ultimos7Dias.push({
        fecha: fecha.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        cantidad: incidenciasDia
      });
    }
    
    return ultimos7Dias;
  }

  // =======================================
  // FILTROS Y BÚSQUEDAS
  // =======================================

  static filtrarIncidencias(filtros) {
    let incidencias = this.getAllIncidencias();

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      incidencias = incidencias.filter(inc => 
        inc.titulo.toLowerCase().includes(busqueda) ||
        inc.descripcion.toLowerCase().includes(busqueda) ||
        inc.ubicacion.toLowerCase().includes(busqueda) ||
        inc.equipoAfectado.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.categoria) {
      incidencias = incidencias.filter(inc => inc.categoria === filtros.categoria);
    }

    if (filtros.subcategoria) {
      incidencias = incidencias.filter(inc => inc.subcategoria === filtros.subcategoria);
    }

    if (filtros.estado) {
      incidencias = incidencias.filter(inc => inc.estado === filtros.estado);
    }

    if (filtros.prioridad) {
      incidencias = incidencias.filter(inc => inc.prioridad === filtros.prioridad);
    }

    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      incidencias = incidencias.filter(inc => 
        new Date(inc.fechaCreacion) >= fechaDesde
      );
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      incidencias = incidencias.filter(inc => 
        new Date(inc.fechaCreacion) <= fechaHasta
      );
    }

    return incidencias;
  }

  // =======================================
  // UTILIDADES
  // =======================================

  static exportarDatos() {
    const incidencias = this.getAllIncidencias();
    const estadisticas = this.getEstadisticas();
    
    const datos = {
      fecha_exportacion: new Date().toISOString(),
      total_incidencias: incidencias.length,
      estadisticas,
      incidencias: incidencias.map(inc => ({
        ...inc,
        fotos: inc.fotos.map(foto => ({
          ...foto,
          dataUrl: foto.dataUrl.substring(0, 50) + '...' // Truncar para el export
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidencias_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static limpiarDatos() {
    localStorage.removeItem(STORAGE_KEYS.INCIDENCIAS);
    localStorage.removeItem(STORAGE_KEYS.CONFIGURACION);
  }

  static inicializarDatosPrueba() {
    const datosPrueba = [
      {
        id: 'demo_1',
        titulo: 'Refrigerador principal perdiendo temperatura',
        descripcion: 'El refrigerador de la cocina principal no mantiene la temperatura adecuada. Los productos lácteos están empezando a mostrar signos de deterioro.',
        categoria: 'equipos',
        subcategoria: 'refrigeracion',
        prioridad: 'critica',
        estado: 'abierta',
        ubicacion: 'Cocina Principal',
        equipoAfectado: 'Refrigerador Industrial #1',
        personaReporta: 'Chef Principal',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        fotos: [],
        comentarios: [
          {
            id: 1,
            texto: 'Incidencia creada - temperatura detectada a 8°C cuando debería estar a 4°C',
            autor: 'Chef Principal',
            fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            tipo: 'sistema'
          }
        ]
      },
      {
        id: 'demo_2',
        titulo: 'Cliente reporta calidad deficiente en hamburguesa',
        descripcion: 'Cliente en mesa 5 reporta que la hamburguesa llegó fría y la carne parece poco cocida.',
        categoria: 'clientes',
        subcategoria: 'queja_comida',
        prioridad: 'alta',
        estado: 'en_progreso',
        ubicacion: 'Mesa 5',
        equipoAfectado: '',
        personaReporta: 'Mesero Juan',
        fechaCreacion: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        fotos: [],
        comentarios: [
          {
            id: 1,
            texto: 'Incidencia creada',
            autor: 'Mesero Juan',
            fecha: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            tipo: 'sistema'
          },
          {
            id: 2,
            texto: 'Se reemplazó el plato y se ofreció descuento del 20%',
            autor: 'Supervisor',
            fecha: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            tipo: 'comentario'
          }
        ]
      }
    ];

    localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(datosPrueba));
  }
}

export default IncidenciaService;