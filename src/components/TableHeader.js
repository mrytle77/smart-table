import React from 'react';
import { TableHead, TableRow, TableCell, TableSortLabel } from '@mui/material';

const TableHeader = ({ columns, sortConfig, onSort }) => {
  const createSortHandler = (column) => () => {
    onSort(column);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column, index) => (
          <TableCell
            key={column}
            sortDirection={sortConfig.find(config => config.key === column)?.direction || false}
            style={{
              position: 'sticky',
              top: 0,
              left: index < 2 ? `${index * 0}px` : 'auto',
              zIndex: index < 2 ? 2 : 1, 
              backgroundColor: '#fafafa',
              borderRight: '1px solid #ddd',
              width: '150px', 
            }}
          >
            <TableSortLabel
              active={!!sortConfig.find(config => config.key === column)}
              direction={sortConfig.find(config => config.key === column)?.direction || 'asc'}
              onClick={createSortHandler(column)}
            >
              {column}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
