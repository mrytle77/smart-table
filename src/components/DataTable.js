import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TableSortLabel, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Grid, TablePagination, CircularProgress, Typography,  Box, Accordion, AccordionSummary, AccordionDetails, Button, Divider, Card, CardContent,Chip, Fade, useTheme, useMediaQuery} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {ExpandMore as ExpandMoreIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const StyledSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: { width: '20ch' },
  },
}));

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const TableHeader = ({ columns, sortConfig, onSort }) => (
  <TableHead>
    <TableRow>
      {columns.map((column) => (
        <TableCell key={column}>
          <TableSortLabel
            active={sortConfig.some(config => config.key === column)}
            direction={sortConfig.find(config => config.key === column)?.direction || 'asc'}
            onClick={() => onSort(column)}
          >
            {column}
          </TableSortLabel>
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

const TableRowComponent = ({ row, columns }) => (
  <TableRow hover>
    {columns.map((column) => (
      <TableCell key={column}>{row[column]}</TableCell>
    ))}
  </TableRow>
);

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
  const [filterExpanded, setFilterExpanded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const handleColumnToggle = (event) => {
    const selectedColumns = event.target.value;
    setVisibleColumns(allColumns.filter((column) => selectedColumns.includes(column)));
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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;
        return item[key].toString().toLowerCase().includes(value.toLowerCase());
      }) && visibleColumns.some((column) => 
        item[column].toString().toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }, [data, debouncedFilters, visibleColumns, filterText]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      for (let { key, direction } of sortConfig) {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderFilterInput = (column) => (
    <TextField
      label={`Filter ${column}`}
      variant="outlined"
      size="small"
      fullWidth
      margin="dense"
      value={filters[column] || ''}
      onChange={(e) => handleFilterChange(column, e.target.value)}
      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
    />
  );

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography variant="h6" color="error">{error}</Typography></Box>;

  return (
    <Fade in={!loading}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center" mb={3}>
            <Grid item xs={12} md={6}>
              <StyledSearch>
                <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  fullWidth
                  variant="standard"
                />
              </StyledSearch>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl size="small" variant="outlined" fullWidth>
                <InputLabel id="column-select-label">Columns</InputLabel>
                <Select
                  labelId="column-select-label"
                  id="column-select"
                  multiple
                  value={visibleColumns}
                  onChange={handleColumnToggle}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
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
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleReset}
                fullWidth
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          
          <Accordion
            expanded={filterExpanded}
            onChange={() => setFilterExpanded(!filterExpanded)}
            elevation={0}
            sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
              <Typography variant="h6">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              <Grid container spacing={2}>
                {allColumns.map(column => (
                  <Grid item xs={12} sm={6} md={4} key={column}>
                    {renderFilterInput(column)}
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          
          <Divider sx={{ my: 2 }} />
          
          <TableContainer sx={{ maxHeight: isMobile ? '50vh' : '60vh', overflowY: 'auto', overflowX: 'auto' }}>
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
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>
    </Fade>
  );
};

export default DataTable;