import { getConnection } from '../Mysql/DB_Connection.js';


// Get all contacts function 
export async function getAllContacts() {
    const db = await getConnection();
    const [rows] = await db.execute(`
        SELECT 
            c.id, c.first_name, c.last_name, c.email, c.phone, c.profile_img,
            a.address_type, a.street, a.state, a.country
        FROM Contact c
        LEFT JOIN Address a ON c.id = a.contact_id
    `);

    const contacts = {};

    for (const row of rows) {
        if (!contacts[row.id]) {
            contacts[row.id] = {
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone,
                profile_img: row.profile_img ? row.profile_img.toString('base64') : null,
                addresses: []
            };
        }

        if (row.address_type) {
            contacts[row.id].addresses.push({
                contact_id: row.id,
                address_type: row.address_type,
                street: row.street,
                state: row.state,
                country: row.country
            });
        }
    }
    return Object.values(contacts);
}


export async function getAllContactsByID(id) {
  const db = await getConnection();

  const [contactRows] = await db.execute(`SELECT * FROM Contact WHERE id = ?`, [id]);
  const [addressRows] = await db.execute(`SELECT contact_id, address_type, street, state, country FROM Address WHERE contact_id = ?`, [id]);

  if (contactRows.length === 0) return { message: "Contact not found" };

  return {
    ...contactRows[0],
    profile_img: contactRows[0].profile_img ? contactRows[0].profile_img.toString('base64') : null,
    addresses: addressRows
  };
}



// Delete contact function
export async function deleteContactByID(id) {
    const db = await getConnection();
    await db.execute(`DELETE FROM Address WHERE contact_id = ?`, [id]);
    await db.execute(`DELETE FROM Contact WHERE id = ?`, [id]);

}

// Add new user 
export async function createContact(first_name, last_name, email, phone, profile_img = null) {
    const db = await getConnection();
    const imageBuffer = profile_img ? Buffer.from(profile_img, 'base64') : null;
    const query = `INSERT INTO Contact (first_name, last_name, email, phone, profile_img) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [first_name, last_name, email, phone, imageBuffer]);
    return result.insertId;
}
// Address 
export async function createAddress(contact_id, address_type, street, state, country) {
    const db = await getConnection();
    const query = `INSERT INTO Address (contact_id, address_type, street, state, country) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [contact_id, address_type, street, state, country]);
    return result.insertId;
}


// to update contact & it's address
export async function updateContactAndAddresses(contactId, first_name, last_name, email, phone, profile_img, addresses) {
    const db = await getConnection();
    const imageBuffer = profile_img ? Buffer.from(profile_img, 'base64') : null;
    const updateQuery = `
        UPDATE Contact 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, profile_img = ? 
        WHERE id = ?`;
    await db.query(updateQuery, [first_name, last_name, email, phone, imageBuffer, contactId]);
    await db.query(`DELETE FROM Address WHERE contact_id = ?`, [contactId]);
    for (let a of addresses) {
        await createAddress(contactId, a.address_type, a.street, a.state, a.country);
    }
}

