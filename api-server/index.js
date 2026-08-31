/*
 * Module dependencies
 */
const express = require('express');
const cors = require('cors');
const query = require('./query');
const createEmployee = require('./createCar');
const updateClearance = require('./changeOwner');
const bodyParser = require('body-parser');

const app = express();


// CORS
app.use(cors());

app.options('*', cors());


// JSON body
app.use(bodyParser.json());


// URL encoded body
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);


// ==========================================
// GET EMPLOYEES
// ==========================================
//
// Get all:
// GET /get-employees
//
// Search ID:
// GET /get-employees?key=EMP001
//
// Filter department:
// GET /get-employees?department=IT
//
// Filter status:
// GET /get-employees?status=Active
//
// Department + status:
// GET /get-employees?department=IT&status=Active
//
app.get('/get-employees', async function (req, res) {

    try {

        const result =
            await query.main(req.query);

        let parsedData =
            JSON.parse(result);


        // queryEmployee returns one object
        // instead of an array.
        if (
            req.query.key &&
            !Array.isArray(parsedData)
        ) {

            parsedData = [
                {
                    Key: req.query.key,
                    Record: parsedData
                }
            ];
        }


        res.status(200).json(parsedData);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});


// ==========================================
// CREATE EMPLOYEE
// ==========================================
app.post('/create-employee', async function (req, res) {

    try {

        await createEmployee.main(req.body);

        res.status(200).json({
            message: 'Employee identity created successfully'
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});


// ==========================================
// UPDATE CLEARANCE STATUS
// ==========================================
app.post('/update-clearance', async function (req, res) {

    try {

        await updateClearance.main(req.body);

        res.status(200).json({
            message: 'Clearance status updated successfully'
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});


// ==========================================
// START SERVER
// ==========================================
app.listen(
    3000,
    () => console.log(
        'Enterprise Identity API is running at port 3000'
    )
);