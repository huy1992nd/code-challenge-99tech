import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Middleware
app.use(bodyParser.json());

// Routes

/**
 * Create a new resource
 */
app.post('/resources', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newResource = await prisma.resource.create({
            data: {
                id: uuidv4(),
                name,
                description,
            },
        });
        res.status(201).json(newResource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

/**
 * List all resources with basic filters
 */
app.get('/resources', async (req, res) => {
    try {
        const { name } = req.query;
        const filters = name ? { where: { name: { contains: name  } } } : {};

        const resources = await prisma.resource.findMany(filters);
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

/**
 * Get details of a specific resource
 */
app.get('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

/**
 * Update details of a resource
 */
app.put('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedResource = await prisma.resource.update({
            where: { id },
            data: {
                name,
                description,
            },
        });

        res.status(200).json(updatedResource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

/**
 * Delete a resource
 */
app.delete('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.resource.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
