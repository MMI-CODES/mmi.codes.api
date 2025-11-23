const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const fs = require('fs');

const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}
const dbPath = path.resolve(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

const initialData = {
    "official_tools": [
        {
            "titre": "UVSQ",
            "site": "https://www.uvsq.fr",
            "description": "Intranet étudiant",
            "emoji": "🏠"
        },
        {
            "titre": "Emploi du temps",
            "site": "https://edt.rambouillet.iut-velizy.uvsq.fr/cal?vt=agendaWeek&et=room",
            "description": "CELCAT",
            "emoji": "🗓️"
        },
        {
            "titre": "e-Campus",
            "site": "https://ecampus.paris-saclay.fr/",
            "description": "Le truc auquel personne n'a accès",
            "emoji": "💻"
        },
        {
            "titre": "Partage",
            "site": "https://partage.uvsq.fr/",
            "description": "Service mail de l'UVSQ",
            "emoji": "📧"
        },
        {
            "titre": "Bulletins",
            "site": "https://bulletins.iut-velizy.uvsq.fr/",
            "description": "Consulter le relevé de notes",
            "emoji": "📋"
        }
    ],
    "tools": [
        {
            "titre": "Better CELCAT",
            "author": "Loan (A2)",
            "site": "https://celcat.pages.dev",
            "description": "EDT plus beau que CELCAT",
            "emoji": "🗓️"
        },
        {
            "titre": "Plan UP",
            "author": "Rayan (A1)",
            "site": "https://plan-up.pages.dev",
            "description": "Consulter les DS et les rendus",
            "emoji": "📜"
        }
    ],
    "ressources": [
        {
            "titre": "o2switch (hébergeur)",
            "site": "https://servd162214.srv.odns.fr:2083/",
            "description": "Hébergeur prenom.nom.mmi-velizy.fr",
            "emoji": "🌐"
        },
        {
            "titre": "Acheter Adobe CC",
            "site": "https://creative.academicsoftware.com/fr/velizy",
            "description": "Lien pour obtenir la réduc sur Adobe CC",
            "emoji": "✍🏼"
        },
        {
            "titre": "Tuto cPanel",
            "site": "https://youtu.be/iPS25YbKX-8",
            "description": "Publier son site sur cPanel",
            "emoji": "🌐"
        }
    ]
};

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            titre TEXT NOT NULL,
            site TEXT NOT NULL,
            author TEXT,
            description TEXT,
            emoji TEXT
        )`);

        db.get("SELECT count(*) as count FROM tools", (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row.count === 0) {
                console.log("Seeding database...");
                const stmt = db.prepare("INSERT INTO tools (category, titre, site, author, description, emoji) VALUES (?, ?, ?, ?, ?, ?)");
                
                for (const [category, tools] of Object.entries(initialData)) {
                    tools.forEach(tool => {
                        stmt.run(category, tool.titre, tool.site, tool.author || null, tool.description || null, tool.emoji || null);
                    });
                }
                stmt.finalize();
                console.log("Database seeded.");
            }
        });
    });
}

app.get('/api/tools', (req, res) => {
    const sql = "SELECT * FROM tools";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        
        const response = {
            official_tools: [],
            tools: [],
            ressources: []
        };

        rows.forEach(row => {
            if (response[row.category]) {
                response[row.category].push({
                    id: row.id,
                    titre: row.titre,
                    site: row.site,
                    author: row.author,
                    description: row.description,
                    emoji: row.emoji
                });
            }
        });

        res.json(response);
    });
});

const authMiddleware = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    const adminPassword = process.env.ADMIN_PASSWORD || '84679512';
    if (password === adminPassword) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || '84679512';
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.post('/api/tools', authMiddleware, (req, res) => {
    const { category, titre, site, author, description, emoji } = req.body;
    const sql = "INSERT INTO tools (category, titre, site, author, description, emoji) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [category, titre, site, author, description, emoji];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": req.body,
            "id": this.lastID
        });
    });
});

app.delete('/api/tools/:id', authMiddleware, (req, res) => {
    const sql = "DELETE FROM tools WHERE id = ?";
    const params = [req.params.id];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
