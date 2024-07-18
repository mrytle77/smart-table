import React from 'react';
import { TableRow, TableCell } from '@mui/material';

const TableRowComponent = ({ row, columns }) => {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell key={column}>{row[column]}</TableCell>
      ))}
    </TableRow>
  );
};

export default TableRowComponent;