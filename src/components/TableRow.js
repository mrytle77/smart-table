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
            left: index === 0 ? 0 : index === 1 ? '0px' : 'auto', // Adjust left for sticky columns
            zIndex: index < 2 ? 1 : 'auto', // Ensure sticky columns have higher z-index
            backgroundColor: index < 2 ? '#fafafa' : 'inherit',
            borderRight: '1px solid #ddd',
            width: '150px', // Adjust width as needed
          }}
        >
          {row[column]}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TableRowComponent;
