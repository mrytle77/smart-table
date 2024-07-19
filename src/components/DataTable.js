import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Grid,
  TablePagination,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import TableHeader from './TableHeader';
import TableRowComponent from './TableRow';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const DataTable = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get('https://mocki.io/v1/2f46dfdc-dd38-4bd5-a81b-7bb6d336d018');
        const response = await axios.get('https://mocki.io/v1/8c16602d-78a0-42e4-b9a2-40f1a7e40cca');
        const initialColumns = response.data.length ? Object.keys(response.data[0]) : [];
        setData(response.data);
        setOriginalData(response.data);
        setAllColumns(initialColumns);
        setVisibleColumns(initialColumns);
        setLoading(false);
      } catch (error) {
        setError('Error fetching data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (column) => {
    const existingConfig = sortConfig.find(config => config.key === column);
    let newSortConfig;

    if (existingConfig) {
      const newDirection = existingConfig.direction === 'asc' ? 'desc' : 'asc';
      newSortConfig = sortConfig.map(config =>
        config.key === column ? { ...config, direction: newDirection } : config
      );
    } else {
      newSortConfig = [...sortConfig, { key: column, direction: 'asc' }];
    }

    setSortConfig(newSortConfig);
  };

  const handleFilterChange = (column, value) => {
    setFilters({
      ...filters,
      [column]: value,
    });
  };

  const handleFilterTextChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleColumnToggle = (event) => {
    const selectedColumns = event.target.value;
    const orderedSelectedColumns = allColumns.filter((column) => selectedColumns.includes(column));
    setVisibleColumns(orderedSelectedColumns);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value === 'All' ? data.length : parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleReset = () => {
    setData(originalData);
    setFilters({});
    setFilterText('');
    setSortConfig([]);
    setVisibleColumns(allColumns);
    setPage(0);
    setRowsPerPage(10);
  };

  const filteredData = data.filter((item) => {
    return Object.keys(debouncedFilters).every((key) => {
      const value = debouncedFilters[key];
      if (!value) return true;
      if (typeof value === 'string') {
        return item[key].toString().toLowerCase().includes(value.toLowerCase());
      }
      if (typeof value === 'number') {
        return item[key] === value;
      }
      return true;
    }) && visibleColumns.some((column) => item[column].toString().toLowerCase().includes(filterText.toLowerCase()));
  });

  const sortedData = [...filteredData].sort((a, b) => {
    for (let { key, direction } of sortConfig) {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderFilterInput = (column) => {
    const handleChange = (event) => handleFilterChange(column, event.target.value);
    if (typeof data[0][column] === 'string') {
      return <TextField label={`Filter by ${column}`} variant="outlined" fullWidth onChange={handleChange} />;
    }
    if (typeof data[0][column] === 'number') {
      return <TextField type="number" label={`Filter by ${column}`} variant="outlined" fullWidth onChange={handleChange} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="center">
            {allColumns.map(column => (
              <Grid item xs={12} sm={6} md={4} key={column}>
                {renderFilterInput(column)}
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="primary" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Grid container spacing={2} alignItems="center" mt={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="column-select-label">Columns</InputLabel>
            <Select
              labelId="column-select-label"
              id="column-select"
              multiple
              value={visibleColumns}
              onChange={handleColumnToggle}
              renderValue={(selected) => (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {selected.length === allColumns.length ? 'All Columns' : selected.join(', ')}
                </div>
              )}
            >
              {allColumns.map((column) => (
                <MenuItem key={column} value={column}>
                  <Checkbox checked={visibleColumns.includes(column)} />
                  <ListItemText primary={column} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Filter"
            variant="outlined"
            fullWidth
            margin="normal"
            value={filterText}
            onChange={handleFilterTextChange}
            InputProps={{
              endAdornment: (
                <Tooltip title="Search">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Button variant="contained" color="secondary" onClick={handleReset} fullWidth>
            Reset
          </Button>
        </Grid>
      </Grid>
      <TableContainer style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHeader columns={visibleColumns} sortConfig={sortConfig} onSort={handleSort} />
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRowComponent key={index} row={row} columns={visibleColumns} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: data.length }]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;
