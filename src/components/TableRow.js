import React from 'react';
import { TableCell, TableRow } from '@mui/material';

const TableRowComponent = ({ row, columns }) => {
  return (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={column}
          style={{
            position: index < 2 ? 'sticky' : 'static',
            left: index === 0 ? 0 : index === 1 ? '0px' : 'auto',
            zIndex: index < 2 ? 1 : 'auto', 
            backgroundColor: index < 2 ? '#fafafa' : 'inherit',
            borderRight: '1px solid #ddd',
            width: '150px', 
          }}
        >
          {row[column]}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TableRowComponent;
