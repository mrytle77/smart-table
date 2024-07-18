import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableContainer, Paper, TextField } from '@mui/material';
import TableHeader from './TableHeader';
import TableRowComponent from './TableRow';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://mocki.io/v1/2f46dfdc-dd38-4bd5-a81b-7bb6d336d018');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSort = (column) => {
    const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
    setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const columns = data.length ? Object.keys(data[0]) : [];

  return (
    <Paper>
      <TextField
        label="Filter"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setFilterText(e.target.value)}
      />
      <TableContainer>
        <Table>
          <TableHeader columns={columns} sortConfig={sortConfig} onSort={handleSort} />
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRowComponent key={index} row={row} columns={columns} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTable;