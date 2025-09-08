import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiPlus, FiEdit, FiShield, FiMail, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { DataTable, SearchAndFilter } from '../../components/DataTable';
import { UserFormModal } from '../../components/Modals';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    Usuario_Nombre: '',
    Usuario_Apellido: '',
    Usuario_Correo: '',
    Usuario_Contrasena: '',
    Rol_Id: '',
    Usuario_Estado: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros disponibles para la búsqueda
  const filterOptions = [
    {
      id: 'role',
      label: 'Rol',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los roles' },
        { value: 'Administrador', label: 'Administrador' },
        { value: 'Gerente', label: 'Gerente' },
        { value: 'Empleado', label: 'Empleado' },
        { value: 'Visualizador', label: 'Visualizador' }
      ]
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      defaultValue: '',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: '1', label: 'Activo' },
        { value: '0', label: 'Inactivo' }
      ]
    }
  ];

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'avatar',
      header: '',
      sortable: false,
      width: '60px',
      render: (user) => (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user.Usuario_Nombre?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )
    },
    {
      field: 'Usuario_Nombre',
      header: 'Nombre',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.Usuario_Nombre}</div>
          <div className="text-sm text-gray-500">{user.Usuario_Apellido}</div>
        </div>
      )
    },
    {
      field: 'Usuario_Correo',
      header: 'Email',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <FiMail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{user.Usuario_Correo}</span>
        </div>
      )
    },
    {
      field: 'Rol_Nombre',
      header: 'Rol',
      render: (user) => {
        const roleColors = {
          'Administrador': 'bg-red-100 text-red-800',
          'Gerente': 'bg-blue-100 text-blue-800',
          'Empleado': 'bg-green-100 text-green-800',
          'Visualizador': 'bg-gray-100 text-gray-800'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roleColors[user.Rol_Nombre] || 'bg-gray-100 text-gray-800'
          }`}>
            {user.Rol_Nombre || 'Sin rol'}
          </span>
        );
      }
    },
    {
      field: 'Usuario_Estado',
      header: 'Estado',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.Usuario_Estado === 1 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.Usuario_Estado === 1 ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers();
      console.log('Users loaded:', response);
      
      // Asegurar que tenemos un array
      const usersData = response.data || response.users || response || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar roles
  const loadRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      const rolesData = response.data || response.roles || response || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar los roles');
      setRoles([]);
    }
  };

  // Abrir modal para crear usuario
  const handleCreateUser = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      Usuario_Nombre: '',
      Usuario_Apellido: '',
      Usuario_Correo: '',
      Usuario_Contrasena: '',
      Rol_Id: '',
      Usuario_Estado: 1
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar usuario
  const handleEditUser = (user) => {
    setIsEditing(true);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      Usuario_Nombre: '',
      Usuario_Apellido: '',
      Usuario_Correo: '',
      Usuario_Contrasena: '',
      Rol_Id: '',
      Usuario_Estado: 1
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Actualizar usuario existente
        await userService.updateUser(selectedUser.Usuario_Id, {
          Usuario_Nombre: data.Usuario_Nombre,
          Usuario_Apellido: data.Usuario_Apellido,
          Usuario_Correo: data.Usuario_Correo,
          Rol_Id: data.Rol_Id
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await userService.createUser(data);
        toast.success('Usuario creado exitosamente');
      }
      
      handleCloseModal();
      loadUsers(); // Recargar la lista
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar usuarios según los criterios de búsqueda
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !filters.search || 
        user.Usuario_Nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.Usuario_Apellido?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.Usuario_Correo?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = !filters.role || user.Rol_Nombre === filters.role;
      const matchesStatus = !filters.status || user.Usuario_Estado === parseInt(filters.status);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Manejar toggle de estado de usuario
  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleUserStatus(user.Usuario_Id);
      toast.success(`Usuario ${user.Usuario_Estado === 1 ? 'desactivado' : 'activado'} exitosamente`);
      loadUsers(); // Recargar la lista
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  // Renderizar acciones de fila
  const renderRowActions = (user) => (
    <>
      <button
        onClick={() => handleToggleStatus(user)}
        className={`p-2 rounded-lg transition-colors ${
          user.Usuario_Estado === 1 
            ? 'text-orange-600 hover:bg-orange-50' 
            : 'text-green-600 hover:bg-green-50'
        }`}
        title={user.Usuario_Estado === 1 ? 'Desactivar usuario' : 'Activar usuario'}
      >
        {user.Usuario_Estado === 1 ? (
          <FiToggleRight className="w-4 h-4" />
        ) : (
          <FiToggleLeft className="w-4 h-4" />
        )}
      </button>
      
      <button
        onClick={() => handleEditUser(user)}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar usuario"
      >
        <FiEdit className="w-4 h-4" />
      </button>
    </>
  );

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/10 rounded-full p-3">
              <FiUsers className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra los usuarios del sistema KardexPlus</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/configuracion/sistema"
              className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <FiShield size={16} />
              <span>Configurar Sistema</span>
            </Link>
            
            <Link 
              to="/configuracion/roles"
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiShield size={16} />
              <span>Gestionar Roles</span>
            </Link>
            
            <button 
              onClick={handleCreateUser}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <FiPlus size={16} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <SearchAndFilter
        onFilter={handleFilterChange}
        filters={filterOptions}
        currentFilters={filters}
        totalItems={filteredUsers.length}
        searchPlaceholder="Buscar por nombre, apellido, email..."
      />

      {/* Nota explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiUsers className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Acciones disponibles:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li className="flex items-center space-x-2">
                <FiToggleRight className="w-4 h-4" />
                <span><strong>Toggle:</strong> Activar/Desactivar usuario</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiEdit className="w-4 h-4" />
                <span><strong>Editar:</strong> Modificar información del usuario</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios"
        emptyIcon={FiUsers}
        renderRowActions={renderRowActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        initialSortField="Usuario_Nombre"
        initialSortDirection="asc"
        rowKeyField="Usuario_Id"
      />

      {/* Modal de formulario de usuario */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedUser={selectedUser}
        isLoading={isSubmitting}
        availableRoles={roles}
      />
    </div>
  );
};

export default Users;
