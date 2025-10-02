const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const net = require('net');

const app = express();

// Function to find available port
function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${startPort} is busy, trying ${startPort + 1}...`);
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.listen(startPort);
  });
}

// Function to get local IP address
function getIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Global database variable
let db;

// Create fresh database with all required columns
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./studyhall.db', (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Connected to SQLite database.');
      
      // Enable foreign keys and better performance
      db.run("PRAGMA foreign_keys = ON");
      db.run("PRAGMA journal_mode = WAL");
      
      // Create tables with ALL required columns
      db.serialize(() => {
        // Check if students table exists and has all columns
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='students'`, (err, row) => {
          if (err) {
            console.error('Error checking students table:', err);
            reject(err);
            return;
          }
          
          if (!row) {
            // Create students table if it doesn't exist
            createStudentsTable();
          } else {
            console.log('✅ Students table already exists');
            // Check if study_halls table exists
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='study_halls'`, (err, row) => {
              if (err) {
                console.error('Error checking study_halls table:', err);
                reject(err);
                return;
              }
              
              if (!row) {
                createStudyHallsTable();
              } else {
                console.log('✅ Study halls table already exists');
                resolve();
              }
            });
          }
        });

        function createStudentsTable() {
          db.run(`CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            cabin TEXT NOT NULL,
            hall TEXT NOT NULL,
            phone TEXT NOT NULL,
            fee_paid INTEGER NOT NULL DEFAULT 0,
            fee_due INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Pending',
            join_date DATE,
            left_date DATE,
            monthly_fee INTEGER DEFAULT 0,
            last_fee_calculated_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`, (err) => {
            if (err) {
              console.error('Error creating students table:', err);
              reject(err);
              return;
            }
            console.log('✅ Students table created - ready for manual data entry');
            createStudyHallsTable();
          });
        }

        function createStudyHallsTable() {
          db.run(`CREATE TABLE study_halls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            capacity INTEGER NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`, (err) => {
            if (err) {
              console.error('Error creating study_halls table:', err);
              reject(err);
              return;
            }
            console.log('✅ Study halls table created - ready for manual data entry');
            resolve();
          });
        }
      });
    });
  });
}

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

// ========== ALL API ROUTES ==========

// Test route - ALWAYS returns JSON
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Database check endpoint
app.get('/api/db-check', (req, res) => {
  const results = {};
  
  db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
    if (err) {
      console.error('Error counting students:', err);
      return res.status(500).json({ error: err.message });
    }
    results.studentsCount = row.count;
    
    db.get("SELECT COUNT(*) as count FROM study_halls", (err, row) => {
      if (err) {
        console.error('Error counting study halls:', err);
        return res.status(500).json({ error: err.message });
      }
      results.studyHallsCount = row.count;
      
      res.json(results);
    });
  });
});

// Students routes
app.get('/api/students', (req, res) => {
  console.log('Fetching students...');
  
  db.all("SELECT * FROM students ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error('Database error in /api/students:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Found ${rows.length} students`);
    res.json(rows);
  });
});

app.get('/api/students/recent', (req, res) => {
  db.all("SELECT * FROM students ORDER BY created_at DESC LIMIT 5", (err, rows) => {
    if (err) {
      console.error('Database error in /api/students/recent:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Fetching student ${id}`);
  
  db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Database error in /api/students/:id:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    
    res.json(row);
  });
});

app.post('/api/students', (req, res) => {
  console.log('=== ADD STUDENT REQUEST ===');
  console.log('Raw body:', req.body);

  const { name, cabin, hall, phone, feePaid, feeDue, monthlyFee, joinDate } = req.body;
  
  console.log('Parsed fields:', {
    name, cabin, hall, phone, feePaid, feeDue, monthlyFee, joinDate
  });

  // Input validation
  if (!name) {
    console.log('Validation failed: Name is required');
    return res.status(400).json({ error: 'Student name is required' });
  }
  if (!cabin) {
    console.log('Validation failed: Cabin is required');
    return res.status(400).json({ error: 'Cabin number is required' });
  }
  if (!hall) {
    console.log('Validation failed: Hall is required');
    return res.status(400).json({ error: 'Study hall is required' });
  }
  if (!phone) {
    console.log('Validation failed: Phone is required');
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Set default values
  const status = (parseInt(feeDue) === 0) ? 'Paid' : 'Pending';
  const join_date = joinDate || new Date().toISOString().split('T')[0];
  const monthly_fee = parseInt(monthlyFee) || 0;
  const fee_paid = parseInt(feePaid) || 0;
  const fee_due = parseInt(feeDue) || 0;

  console.log('Final values for insertion:', {
    name, cabin, hall, phone, fee_paid, fee_due, status, join_date, monthly_fee
  });

  const sql = `INSERT INTO students 
    (name, cabin, hall, phone, fee_paid, fee_due, status, join_date, monthly_fee) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, 
    [name, cabin, hall, phone, fee_paid, fee_due, status, join_date, monthly_fee], 
    function(err) {
      if (err) {
        console.error('❌ DATABASE INSERT ERROR:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ 
          error: 'Failed to add student to database',
          details: err.message 
        });
        return;
      }
      
      console.log(`✅ STUDENT ADDED SUCCESSFULLY! ID: ${this.lastID}`);
      
      // Verify the student was actually added
      db.get("SELECT * FROM students WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          console.error('Error verifying student insertion:', err);
        } else if (row) {
          console.log('✅ Student verification - Found in database:', row);
        } else {
          console.error('❌ Student verification - NOT found in database!');
        }
      });
      
      res.json({ 
        id: this.lastID,
        message: 'Student added successfully'
      });
    }
  );
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Updating student ${id}:`, req.body);
  
  const { name, cabin, hall, phone, feePaid, feeDue, monthlyFee, joinDate, leftDate } = req.body;
  const status = (parseInt(feeDue) === 0) ? 'Paid' : 'Pending';
  
  if (!name || !cabin || !hall || !phone || feePaid === undefined || feeDue === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const sql = `
    UPDATE students 
    SET name = ?, cabin = ?, hall = ?, phone = ?, fee_paid = ?, fee_due = ?, 
        status = ?, monthly_fee = ?, join_date = ?, left_date = ? 
    WHERE id = ?
  `;
  
  db.run(
    sql,
    [
      name, cabin, hall, phone, 
      parseInt(feePaid) || 0, 
      parseInt(feeDue) || 0, 
      status, 
      parseInt(monthlyFee) || 0, 
      joinDate, 
      leftDate || null, 
      id
    ],
    function(err) {
      if (err) {
        console.error('Database error in PUT /api/students/:id:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      console.log(`✅ Student ${id} updated successfully`);
      res.json({ message: 'Student updated successfully' });
    }
  );
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Deleting student ${id}`);
  
  db.run("DELETE FROM students WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Database error in DELETE /api/students/:id:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    
    console.log(`✅ Student ${id} deleted successfully`);
    res.json({ message: 'Student deleted successfully' });
  });
});

// Fee Management Routes
app.post('/api/fees/calculate-monthly', (req, res) => {
  console.log('Calculating monthly fees...');
  const currentDate = new Date().toISOString().split('T')[0];
  
  const query = `
    UPDATE students 
    SET fee_due = fee_due + monthly_fee,
        last_fee_calculated_date = ?,
        status = CASE WHEN monthly_fee > 0 AND (fee_due + monthly_fee) > 0 THEN 'Pending' ELSE status END
    WHERE left_date IS NULL 
    AND monthly_fee > 0
    AND (last_fee_calculated_date IS NULL OR last_fee_calculated_date < date(?, '-1 month'))
  `;
  
  db.run(query, [currentDate, currentDate], function(err) {
    if (err) {
      console.error('Database error in /api/fees/calculate-monthly:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: `Monthly fees calculated for ${this.changes} students`,
      affected: this.changes
    });
  });
});

app.get('/api/upcoming-fees', (req, res) => {
  console.log('Fetching upcoming fees...');
  
  const query = `
    SELECT *, 
      CASE 
        WHEN last_fee_calculated_date IS NULL THEN join_date
        ELSE date(last_fee_calculated_date, '+1 month')
      END as next_fee_date
    FROM students 
    WHERE left_date IS NULL 
    AND monthly_fee > 0
    ORDER BY next_fee_date ASC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error in /api/upcoming-fees:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.put('/api/students/:id/leave', (req, res) => {
  const { id } = req.params;
  const { left_date } = req.body;
  
  const leaveDate = left_date || new Date().toISOString().split('T')[0];
  console.log(`Marking student ${id} as left on ${leaveDate}`);
  
  db.run(
    "UPDATE students SET left_date = ? WHERE id = ?",
    [leaveDate, id],
    function(err) {
      if (err) {
        console.error('Database error in /api/students/:id/leave:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      res.json({ message: 'Student marked as left successfully' });
    }
  );
});

app.put('/api/students/:id/reactivate', (req, res) => {
  const { id } = req.params;
  console.log(`Reactivating student ${id}`);
  
  db.run(
    "UPDATE students SET left_date = NULL WHERE id = ?",
    [id],
    function(err) {
      if (err) {
        console.error('Database error in /api/students/:id/reactivate:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      res.json({ message: 'Student reactivated successfully' });
    }
  );
});

// Study Halls routes
app.get('/api/study-halls', (req, res) => {
  console.log('Fetching study halls...');
  db.all("SELECT * FROM study_halls ORDER BY name", (err, rows) => {
    if (err) {
      console.error('Database error in /api/study-halls:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Found ${rows.length} study halls`);
    res.json(rows);
  });
});

app.get('/api/study-halls/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Fetching study hall ${id}`);
  
  db.get("SELECT * FROM study_halls WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Database error in /api/study-halls/:id:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Study hall not found' });
      return;
    }
    
    res.json(row);
  });
});

app.post('/api/study-halls', (req, res) => {
  console.log('Adding study hall:', req.body);
  const { name, capacity, location, description } = req.body;
  
  if (!name || !capacity || !location) {
    return res.status(400).json({ error: 'Name, capacity, and location are required' });
  }
  
  db.run(
    "INSERT INTO study_halls (name, capacity, location, description) VALUES (?, ?, ?, ?)",
    [name, capacity, location, description || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Study hall with this name already exists' });
        }
        console.error('Database error in POST /api/study-halls:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        message: 'Study hall added successfully'
      });
    }
  );
});

app.put('/api/study-halls/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Updating study hall ${id}:`, req.body);
  
  const { name, capacity, location, description } = req.body;
  
  if (!name || !capacity || !location) {
    return res.status(400).json({ error: 'Name, capacity, and location are required' });
  }
  
  db.run(
    "UPDATE study_halls SET name = ?, capacity = ?, location = ?, description = ? WHERE id = ?",
    [name, capacity, location, description || '', id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Study hall with this name already exists' });
        }
        console.error('Database error in PUT /api/study-halls/:id:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Study hall not found' });
        return;
      }
      
      res.json({ message: 'Study hall updated successfully' });
    }
  );
});

app.delete('/api/study-halls/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Deleting study hall ${id}`);
  
  // Check if there are students in this hall
  db.get("SELECT COUNT(*) as count FROM students WHERE hall = (SELECT name FROM study_halls WHERE id = ?)", [id], (err, row) => {
    if (err) {
      console.error('Database error in DELETE /api/study-halls/:id:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      return res.status(400).json({ error: 'Cannot delete study hall with students assigned to it' });
    }
    
    db.run("DELETE FROM study_halls WHERE id = ?", [id], function(err) {
      if (err) {
        console.error('Database error in DELETE /api/study-halls/:id:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Study hall not found' });
        return;
      }
      
      res.json({ message: 'Study hall deleted successfully' });
    });
  });
});

// Dashboard data - FIXED PENDING FEES CALCULATION
app.get('/api/dashboard', (req, res) => {
  console.log('Fetching dashboard data...');
  
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM students) as totalStudents,
      (SELECT COUNT(*) FROM study_halls) as totalHalls,
      (SELECT COUNT(*) FROM students WHERE left_date IS NULL OR left_date = '') as activeStudents,
      (SELECT COUNT(*) FROM students WHERE left_date IS NOT NULL AND left_date != '') as leftStudents,
      (SELECT COALESCE(SUM(monthly_fee), 0) FROM students WHERE left_date IS NULL OR left_date = '') as monthlyFeeTotal,
      (SELECT COALESCE(SUM(fee_paid), 0) FROM students) as totalFees,
      (SELECT COALESCE(SUM(fee_due), 0) FROM students) as pendingFees,
      (SELECT COALESCE(SUM(fee_paid + fee_due), 0) FROM students) as totalFeeAmount,
      (SELECT COUNT(*) FROM students WHERE fee_due > 0) as studentsWithPendingFees
  `;
  
  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error in dashboard:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    const dashboardData = {
      totalStudents: row.totalStudents || 0,
      totalHalls: row.totalHalls || 0,
      activeStudents: row.activeStudents || 0,
      leftStudents: row.leftStudents || 0,
      monthlyFeeTotal: row.monthlyFeeTotal || 0,
      totalFees: row.totalFees || 0,
      pendingFees: row.pendingFees || 0,
      totalFeeAmount: row.totalFeeAmount || 0,
      studentsWithPendingFees: row.studentsWithPendingFees || 0
    };
    
    console.log('Dashboard data with fixed fee calculations:', dashboardData);
    res.json(dashboardData);
  });
});

// Reports data - FIXED FEE CALCULATION
app.get('/api/reports/fee-collection', (req, res) => {
  console.log('Fetching fee collection report...');
  
  const query = `
    SELECT 
      sh.name as hall,
      COUNT(s.id) as totalStudents,
      COALESCE(SUM(s.fee_paid), 0) as feesCollected,
      COALESCE(SUM(s.fee_due), 0) as feesPending,
      COALESCE(SUM(s.fee_paid + s.fee_due), 0) as totalFeeAmount,
      CASE 
        WHEN COUNT(s.id) = 0 OR COALESCE(SUM(s.fee_paid + s.fee_due), 0) = 0 THEN 0
        ELSE ROUND((COALESCE(SUM(s.fee_paid), 0) * 100.0 / COALESCE(SUM(s.fee_paid + s.fee_due), 0)), 1)
      END as collectionRate
    FROM study_halls sh
    LEFT JOIN students s ON sh.name = s.hall
    GROUP BY sh.id, sh.name
    ORDER BY sh.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error in /api/reports/fee-collection:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format the data properly
    const formattedRows = rows.map(row => ({
      hall: row.hall,
      totalStudents: row.totalStudents,
      feesCollected: row.feesCollected,
      feesPending: row.feesPending,
      totalFeeAmount: row.totalFeeAmount,
      collectionRate: row.collectionRate === 0 ? '0%' : `${row.collectionRate}%`
    }));
    
    console.log('Fee collection report with fixed calculations:', formattedRows);
    res.json(formattedRows);
  });
});

// Debug endpoint to see all student fees
app.get('/api/debug/fees', (req, res) => {
  console.log('Debug: Fetching all student fees...');
  
  const query = `
    SELECT 
      id, 
      name, 
      fee_paid, 
      fee_due, 
      monthly_fee,
      status,
      (fee_paid + fee_due) as total_amount
    FROM students 
    ORDER BY name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error in debug fees:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    const summary = {
      totalStudents: rows.length,
      totalFeePaid: rows.reduce((sum, row) => sum + (row.fee_paid || 0), 0),
      totalFeeDue: rows.reduce((sum, row) => sum + (row.fee_due || 0), 0),
      studentsWithPendingFees: rows.filter(row => (row.fee_due || 0) > 0).length,
      detailedData: rows
    };
    
    console.log('Fee debug summary:', summary);
    res.json(summary);
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Serve static files for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server with available port
async function startServer() {
  try {
    const PORT = await findAvailablePort(3000);
    
    // Initialize database first
    await initializeDatabase();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n✨ ========================================');
      console.log('🎓 STUDY HALL MANAGEMENT SYSTEM');
      console.log('========================================');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌐 Network: http://${getIPAddress()}:${PORT}`);
      console.log('========================================\n');
      console.log('✅ Server started successfully!');
      console.log('✅ Database persistence enabled');
      console.log('✅ Fixed fee calculations (pending fees now working)');
      console.log('✅ Use /api/debug/fees to verify fee calculations');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        if (db) {
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('✅ Database connection closed');
            }
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
console.log('🚀 Starting Study Hall Management System...');
startServer();