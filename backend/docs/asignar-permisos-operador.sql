CREATE TABLE Empleados (
    Id INT PRIMARY KEY,
    Nombre VARCHAR(50),
    Puesto VARCHAR(30),
    Salario DECIMAL(10,2)
);

ALTER TABLE Empleados ADD Fecha_Contratacion DATE;
DROP TABLE Empleados;
