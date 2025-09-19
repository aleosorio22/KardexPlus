import { useState, useMemo } from "react";
import DataTable from "./DataTable";
import DataCards from "./DataCards";

export default function ResponsiveDataView({
  data = [],
  columns = [], // Para vista de tabla (desktop)
  renderCard, // Para vista de cards (mobile)
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  rowKeyField = "id",
  pagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  initialSortField = null,
  initialSortDirection = "asc",
  onRowClick,
  onCardClick,
  className = "",
  tableClassName = "",
  cardClassName = "",
  renderRowActions,
  stickyHeader = false,
  mobileBreakpoint = "lg", // Breakpoint donde cambia de cards a tabla
}) {
  // Si no se proporciona renderCard, usar vista de tabla solamente
  if (!renderCard) {
    return (
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyIcon={emptyIcon}
        rowKeyField={rowKeyField}
        pagination={pagination}
        initialPageSize={initialPageSize}
        pageSizeOptions={pageSizeOptions}
        initialSortField={initialSortField}
        initialSortDirection={initialSortDirection}
        onRowClick={onRowClick}
        className={className}
        tableClassName={tableClassName}
        renderRowActions={renderRowActions}
        stickyHeader={stickyHeader}
      />
    );
  }

  // Clases para ocultar/mostrar según breakpoint
  const getBreakpointClasses = () => {
    switch (mobileBreakpoint) {
      case "sm":
        return { mobile: "block sm:hidden", desktop: "hidden sm:block" };
      case "md":
        return { mobile: "block md:hidden", desktop: "hidden md:block" };
      case "lg":
        return { mobile: "block lg:hidden", desktop: "hidden lg:block" };
      case "xl":
        return { mobile: "block xl:hidden", desktop: "hidden xl:block" };
      default:
        return { mobile: "block lg:hidden", desktop: "hidden lg:block" };
    }
  };

  const breakpointClasses = getBreakpointClasses();

  return (
    <div className={className}>
      {/* Vista Mobile - Cards */}
      <div className={breakpointClasses.mobile}>
        <DataCards
          data={data}
          renderCard={renderCard}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          emptyIcon={emptyIcon}
          rowKeyField={rowKeyField}
          pagination={pagination}
          initialPageSize={initialPageSize}
          pageSizeOptions={pageSizeOptions}
          onCardClick={onCardClick || onRowClick}
          cardClassName={cardClassName}
        />
      </div>

      {/* Vista Desktop - Tabla */}
      <div className={breakpointClasses.desktop}>
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          emptyIcon={emptyIcon}
          rowKeyField={rowKeyField}
          pagination={pagination}
          initialPageSize={initialPageSize}
          pageSizeOptions={pageSizeOptions}
          initialSortField={initialSortField}
          initialSortDirection={initialSortDirection}
          onRowClick={onRowClick}
          tableClassName={tableClassName}
          renderRowActions={renderRowActions}
          stickyHeader={stickyHeader}
        />
      </div>
    </div>
  );
}