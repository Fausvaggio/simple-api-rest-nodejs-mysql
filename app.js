const express = require ('express');
const mysql = require('mysql');
const PORT = process.env.PORT || 3050;
const app = express();
///json
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {  
  res.setHeader('Access-Control-Allow-Origin', '*');  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');  
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');  
  res.setHeader('Access-Control-Allow-Credentials', true);  
  next();
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'database'
});

const MessagesMaster = {
  'SuccessRegister'   : 'Descripción registrada.',
  'SuccessUpdate'     : 'Descripción actualizada.',
  'SuccessDelete'     : 'Descripción eliminada.',    
  'WarningRegister'   : 'La descripción ya han sido registrada.',
  'WarningUpdate'     : 'No se puede actualizar, la descripción ya ha sido registrada.',
  'WarningDelete'     : 'No se puede eliminar la descripción.',
  'ErrorRegister'     : '¡Error! En el registro de la descripción.',
  'ErrorUpdate'       : '¡Error! No se puede actualizar la descripción.',
  'ErrorDelete'       : '¡Error! No se puede eliminar la descripción.',
  'UpdateStatus'      : 'Estado ha sido actualizado.',    
  'ErrorStatus'       : 'No se pudo actualizar el estado.',
  'Danger'            : 'Ocurrió un error en el proceso.',
  'Empty'             : 'No hay data registrada.',
  'Info'              : 'Listado de datos.',
};

//#region Master
//:master -> nombre  de la tabla, por ejemplo: rol
//:status -> estado del registro, por ejemplo: All (visualiza todos), 1 (status=1)
app.get('/GetMasters/:master/:status', (req, res) => {
    const { master, status } = req.params;
    let sql="";
    if(status=="All"){
      sql = `SELECT * FROM tb${master}`;
    }else{
      sql = `SELECT * FROM tb${master} where Status=${status}`;
    }
    connection.query(sql, (error, results) => {
      if (error){         
        if(error.errno===1146  || error.errno===1054){
          let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
          res.json(payload);
        }
        else{        
          let payload={"status": true,"type": "error","message": error.sqlMessage};
          res.json(payload);
        }
      }
      else if (results.length > 0) {
        let payload={"status": true,"type": "info","message": MessagesMaster['Info'],"data": results};
        res.json(payload);
      } else {        
        let payload={"status": false,"type": "empty","message": MessagesMaster['Empty']};
        res.json(payload);
      }
    });
}); 

//:master -> nombre  de la tabla, por ejemplo: rol
//:id -> id del registro de la tabla
app.get('/GetMaster/:master/:id', (req, res) => {
    const { master, id } = req.params;
    const sql = `SELECT * FROM tb${master} where Id=${id}`;
    connection.query(sql, (error, results) => {
      if (error){         
        if(error.errno===1146  || error.errno===1054){
          let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
          res.json(payload);
        }
        else{        
          let payload={"status": true,"type": "error","message": error.sqlMessage};
          res.json(payload);
        }
      }
      else if (results.length > 0) {
        let payload={"status": true,"type": "info","message": MessagesMaster['Info'],"data": results};
        res.json(payload);
      } else {        
        let payload={"status": false,"type": "empty","message": MessagesMaster['Empty']};
        res.json(payload);
      }
    });
}); 

//master -> nombre  de la tabla, por ejemplo: rol
//description -> valor a registrar.
app.post('/SetMasters', (req, res) => {  
  const { master, description } = req.body;  
  const value = {
    Description: description, 
    Status: '1' 
  }; 
  const sql = `INSERT INTO tb${master} SET ?`;
  connection.query(sql, value, function (error, results, fields) {
    if (error){
      if(error.errno===1062){
        let payload={"status": true,"type": "warning","message": MessagesMaster['WarningRegister']};
        res.json(payload);
      }
      else if(error.errno===1146  || error.errno===1054){
        let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
        res.json(payload);
      }
      else{        
        let payload={"status": true,"type": "error","message": error.sqlMessage};
        res.json(payload);
      }      
    }     
    else if(results.insertId!==0){
      let payload={"status": true,"type": "success","message": MessagesMaster['SuccessRegister']};
      res.json(payload);
    }
    else{
      let payload={"status": false,"type": "error","message": MessagesMaster['ErrorRegister']};
      res.json(payload);
    }
  });
}); 

// Id -> Identificador del registro a actualizar.
// master -> nombre  de la tabla, por ejemplo: rol.
// description -> valor a actualizar.
app.put('/UpdMasters', (req, res) => {
  const { Id, master, description } = req.body;
  const sql = `UPDATE tb${master} SET Description='${description}' WHERE Id =${Id}`;
  connection.query(sql, function (error, results, fields) {
    if (error){
      if(error.errno===1062){
        let payload={"status": true,"type": "warning","message": MessagesMaster['WarningUpdate']};
        res.json(payload);
      }
      else if(error.errno===1146 || error.errno===1054){
        let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
        res.json(payload);
      }      
      else{        
        let payload={"status": true,"type": "error","message": error.sqlMessage};
        res.json(payload);
      }      
    }     
    else if(results.changedRows>0){
      let payload={"status": true,"type": "success","message": MessagesMaster['SuccessUpdate']};
      res.json(payload);
    }
    else{
      let payload={"status": false,"type": "error","message": MessagesMaster['ErrorUpdate']};
      res.json(payload);
    }
  });
}); 

// Id -> Identificador del registro a actualizar.
// master -> nombre  de la tabla, por ejemplo: rol.
// Status -> estado del registro, activo o desactivo.
app.put('/UpdStatusMasters', (req, res) => {
  const { Id, master, Status } = req.body;
  const sql = `UPDATE tb${master} SET Status='${Status}' WHERE Id =${Id}`;
  connection.query(sql, function (error, results, fields) {
    if (error){
      if(error.errno===1062){
        let payload={"status": true,"type": "warning","message": MessagesMaster['WarningUpdate']};
        res.json(payload);
      }
      else if(error.errno===1146 || error.errno===1054){
        let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
        res.json(payload);
      }      
      else{        
        let payload={"status": true,"type": "error","message": error.sqlMessage};
        res.json(payload);
      }      
    }     
    else if(results.changedRows>0){
      let payload={"status": true,"type": "success","message": MessagesMaster['UpdateStatus']};
      res.json(payload);
    }
    else{
      let payload={"status": false,"type": "error","message": MessagesMaster['ErrorStatus']};
      res.json(payload);
    }
  });
}); 

// Id -> Identificador del registro a eliminar.
// master -> nombre  de la tabla, por ejemplo: rol.
app.delete('/DelMasters/:id/:master', (req, res) => {
  const { id, master } = req.params;
  const sql = `DELETE FROM tb${master} WHERE Id =${id}`;
  connection.query(sql, function (error, results, fields) {
    if (error){
      if(error.errno===1146 || error.errno===1054){
        let payload={"status": true,"type": "error","message": MessagesMaster['Danger']};
        res.json(payload);
      }      
      else{        
        let payload={"status": true,"type": "error","message": error.sqlMessage};
        res.json(payload);
      }      
    }     
    else if(results.affectedRows>0){
      let payload={"status": true,"type": "success","message": MessagesMaster['SuccessDelete']};
      res.json(payload);
    }
    else{
      let payload={"status": false,"type": "error","message": MessagesMaster['ErrorDelete']};
      res.json(payload);
    }
  });
});
//#endregion

app.get('/', (req, res) => {
    res.send('!WELCOME SIMPLE API REST NODE JS!');
});
  

connection.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});
  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 