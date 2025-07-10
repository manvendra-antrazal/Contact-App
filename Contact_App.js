import express from 'express';
import cors from 'cors';
import { getAllContacts, getAllContactsByID, deleteContactByID, createContact, createAddress, updateContactAndAddresses,}
from './Backend/CRUD/CRUD_operations.js';

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all contacts
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching contacts');
  }
});

// Get contact by ID
app.get('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const contacts = await getAllContactsByID(id);
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching contacts');
  }
});

// Delete contact by ID
app.delete('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleteData = await deleteContactByID(id);
    if (deleteData) {
      res.status(200).json({ message: `Contact ${id} deleted successfully.` });
    } else {
      res.status(404).json({ message: `Contact ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting contact');
  }
});

// Create a new contact
app.post('/contacts', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, profile_img, addresses } = req.body;
    const contactId = await createContact(first_name, last_name, email, phone, profile_img);
    if (addresses?.length) {
      for (let a of addresses) {
        await createAddress(contactId, a.address_type, a.street, a.state, a.country);
      }
    }
    res.status(201).json({ message: `Contact ${contactId} added successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create contact');
  }
});

// Update a contact
app.put('/contacts/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const { first_name, last_name, email, phone, profile_img, addresses } = req.body;
    await updateContactAndAddresses(contactId, first_name, last_name, email, phone, profile_img, addresses);
    res.status(200).json({ message: `Contact ${contactId} updated successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update contact');
  }
});

// server starting 
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
