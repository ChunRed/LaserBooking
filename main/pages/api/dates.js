import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'data', 'dates.json');

    if (req.method === 'GET') {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const dates = JSON.parse(fileData);
            res.status(200).json(dates);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error reading dates file' });
        }
    } else if (req.method === 'POST') {
        try {
            const newDates = req.body;

            // Basic validation: ensure it's an array
            if (!Array.isArray(newDates)) {
                return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
            }

            fs.writeFileSync(filePath, JSON.stringify(newDates, null, 2), 'utf8');
            res.status(200).json({ message: 'Dates updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error writing dates file' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
