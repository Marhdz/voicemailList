import React, { useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from "material-table";
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';
import Moment from 'react-moment';

const tableIcons = {
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
};

//Display date
Moment.globalFormat = 'D MMM YYYY';


//API url
const api = axios.create({
  baseURL: `https://api-vm.herokuapp.com`
})

function App(props) {

const {useState} = React


//title:table headers, field:API info
  const [columns] = useState([
    {title: "call_id", field: "call_id", hidden: true},
    {title: "Status", field: "folder", lookup:{'new':'New', 'deleted':'Deleted', 'saved':'Saved'},},
    {title: "From", field: "from", editable: 'never'},
    {title: "To", field: "to", editable: 'never'},
    {title: "Duration", field: "length", editable: 'never'},
    {title: "Caller_id", field: "caller_id_number", editable: 'never'},
    {title: "Time", type:"date", field:"timestamp", editable: 'never', render: rowData => <Moment unix>{rowData.timestamp}</Moment>}
  ])


  const [data, setData] = useState([]); //table data

  //for error handling
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

//gets data from api
  useEffect(() => {
    api.get("/users")
        .then(res => {
            setData(res.data.data)
         })
         .catch(error=>{
             console.log("Error")
         })
  }, [])

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = []
    var newFolder= newData.folder
    var messages= newData.media_id

    if(errorList.length < 1){

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({"data":{"folder":newFolder,"messages":[messages]}});

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("https://api-vm.herokuapp.com/users/", requestOptions)
      .then(response => {
        const dataUpdate = [...data];
        const index = oldData.tableData.call_id;
        dataUpdate[index] = newData;
        setData([...dataUpdate]);
        resolve()
        setIserror(false)
        setErrorMessages([])
        response.text()
        window.location.reload(false);
      })
      .catch(error => {
      setErrorMessages(["Update failed! Server error"])
      setIserror(true)
      resolve()
      });
    } else{
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }
  }

  return (
    <div className="App">

      <Grid container spacing={1} >
          <Grid item xs={3}></Grid>
          <Grid item xs={6}>
          <div>
            {iserror &&
              <Alert severity="error">
                  {errorMessages.map((msg, i) => {
                      return <div key={i}>{msg}</div>
                  })}
              </Alert>
            }
          </div>
            <MaterialTable
              title="Voicemails"
              columns={columns}
              data={data}
              icons={tableIcons}
              //to edit the status
              editable={{
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve) => {
                      handleRowUpdate(newData, oldData, resolve);
                  }),
              }}
              options={{
                headerStyle: {
                  backgroundColor: '#00BC47',
                  color: '#FFF'
                },
                search: false,
                //checkbox
                selection: false,
                paging: false
              }}
              //To use a checkbox, probable use
              // actions={[
              //   {
              //     tooltip: 'Remove All Selected Users',
              //     icon: 'delete',
              //     onClick: (evt, data) => alert('You want to delete ' + data.length + ' rows')
              //   }
              // ]}

            />
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
    </div>
  );
}

export default App;
