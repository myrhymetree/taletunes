import mysql from 'mysql';
import dbConfig from '../config/dbConfig.js';

const getConnection = () => { 

    return mysql.createConnection(dbConfig); 
}

export default getConnection;