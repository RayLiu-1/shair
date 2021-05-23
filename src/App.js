import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TablePagination from '@material-ui/core/TablePagination';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { Checkbox } from '@material-ui/core';
import Box from "@material-ui/core/Box";
import Slider from "@material-ui/core/Slider";
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 1024
  },
  fab: {
    width: '40px',
    height: '40px',
  },
  disableFab: {
    width: '40px',
    height: '40px',
    cursor: 'not-allowed'
  },
  vehiclepaper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    'overflow-wrap': 'break-word'
  },
  loadingCt: {
    display: 'grid',
    justifyContent: 'center'
  },
  searchForm: {
    display: 'flex',
    'justify-content': 'space-around',
    'flex-wrap': 'wrap',
    '& > *': {
      'flex-grow': 1,
      padding: theme.spacing(2),
      'min-width': '150px',
    },
  },
  flexCenter: {
    alignItems: 'center',
    display: 'flex'
  }
}))

function App() {
  const classes = useStyles()
  const [models, setModels] = useState([])
  const [page, setPage] = useState(0);
  const [vehiclesPerPage, setVehiclesPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  // const [searchItems, setSearchItems] = useState({
  //   make: "",
  //   modelyearmin: 1990,
  //   modelyearmax: 2021,
  //   vehicletype: "",
  // });
  const [make, setMake] = useState("")
  const [modelyear, setModelyear] = useState([1990,2021])
  const [vehicletype, setVehicletype] = useState("")
  const [selectYears, setSelectYears] = useState(false)

  const handleChangeRowsPerPage = (event) => {
    setVehiclesPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const submitSearch = async () => {
    setLoading(true)
    let result = null
    if (!make) 
      return
    let url = 'https://vpic.nhtsa.dot.gov/api/vehicles/'
    if ( !vehicletype && !selectYears) {
      url += 'GetModelsForMake/' + make
    } else {
      url += 'GetModelsForMakeYear/make/' + make
    }
    if (vehicletype) {
      url += '/vehicletype/' + vehicletype
    }
    if (selectYears) {
      const urls = []
      for(let i = modelyear[0]; i <= modelyear[1]; i++) {
        urls.push(url + '/modelyear/' + i + '?format=json')
      }
      const promises = Promise.all(urls.map(url => axios.get(url)))
      const responses = await promises
      result = responses.flat()
      const modelIdDict = {}
      result.map(res => res.data.Results).flat().forEach(model => modelIdDict[model.Model_ID] = model)
      setModels(Object.values(modelIdDict))
    }
    else {
      const result = await axios.get(url + '?format=json')
      setModels(result.data.Results)
    }
    setPage(0)
    setLoading(false)
  }

  const handleSearchClick = () => {
    console.dir(modelyear)
    console.log(make)
    console.log(vehicletype)
    submitSearch()
  }

  return (
      <Paper className={classes.paper } >
          <div hidden={!loading}>
            <div className={classes.loadingCt}>
              <CircularProgress />
            </div>
          </div>
          <div hidden={loading}>
            <form  className={classes.searchForm} noValidate autoComplete="off">
              <div className={classes.flexCenter}><TextField onChange={event => setMake(event.target.value)} id="make" label="Make*" variant="outlined" /></div>
              <div className={classes.flexCenter}><TextField onChange={event => setVehicletype(event.target.value)}  id="vehicleType" label="vehicle type" variant="outlined" /></div>
              <Box sx={{ width: 100 }}>
                <span><Checkbox color="primary" onChange={event => setSelectYears(event.target.checked)} />model year</span>

                <Slider
                  getAriaLabel={() => "model year range"}
                  value={modelyear}
                  onChange={(event, newValue) => setModelyear(newValue)}
                  valueLabelDisplay="auto"
                  disabled={!selectYears}
                  min={1990}
                  max={2021}
                />
              </Box>
              
              {make && <div className={classes.flexCenter}><Tooltip title="Search" aria-label="search">
                <Fab color="primary" className={classes.fab}>
                  <SearchIcon onClick={handleSearchClick} />
                </Fab>
              </Tooltip></div>}
              {!make && <div className={classes.flexCenter}><Tooltip title="make is required" aria-label="make is required">
                <Fab className={classes.disableFab}>
                  <SearchIcon />
                </Fab>
              </Tooltip></div>}
              
            </form>
            {!!models.length &&
              <TablePagination
                component="div"
                count={models.length}
                page={page}
                onChangePage={(event, newPage) => setPage(newPage)}
                rowsPerPage={vehiclesPerPage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                rowsPerPageOptions={[20, 40, 60]}
                labelRowsPerPage='vehicles per page'
                
              />
            }
            <Grid  container spacing={2}>
              {models.slice(page*vehiclesPerPage, (page + 1)*vehiclesPerPage).map((model,index) => {
                return (<Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                  <Paper className={classes.vehiclepaper}>
                    <Typography variant="h6" color="textPrimary">
                      {model.Make_Name}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {model.Model_Name}
                    </Typography>
                  </Paper>
                </Grid>)
              })}
            </Grid>
          </div>
          
        </Paper>
    
  );
}

export default App;
