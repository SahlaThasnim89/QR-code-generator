const fs=require('fs')
const path=require('path')
const client=require('./model/db')

const schemaPath=path.join(__dirname,'model','userSchema.sql')

const applySchema=async()=>{
    try {
        const schemaQuery=fs.readFileSync(schemaPath,'utf8')
        await client.query(schemaQuery)
        console.log('Schema applied successfully.')
    } catch (error) {
        console.error('Error applying schema:', error.message);
    } finally {
        client.end();
    }
}

applySchema();
