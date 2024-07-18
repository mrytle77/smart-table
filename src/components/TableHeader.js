import React from 'react';
import { TableHead, TableRow, TableCell, TableSortLabel } from '@mui/material';

const TableHeader = ({ columns, sortConfig, onSort }) => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column}>
            <TableSortLabel
              active={sortConfig.key === column}
              direction={sortConfig.direction}
              onClick={() => onSort(column)}
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