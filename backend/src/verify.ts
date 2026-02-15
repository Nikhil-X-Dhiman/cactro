import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const runVerification = async () => {
  try {
    console.log('--- Starting Verification ---')

    // 1. Register Organizer
    const orgEmail = `org_${Date.now()}@example.com`
    console.log(`\n[1] Registering Organizer: ${orgEmail}`)
    await axios.post(`${API_URL}/auth/register`, {
      email: orgEmail,
      password: 'password123',
      role: 'ORGANIZER',
    })

    // 2. Login Organizer
    console.log('[2] Logging in Organizer...')
    const orgLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: orgEmail,
      password: 'password123',
    })
    const orgToken = orgLoginRes.data.token
    console.log('    Organizer Token obtained.')

    // 3. Register Customer
    const custEmail = `cust_${Date.now()}@example.com`
    console.log(`\n[3] Registering Customer: ${custEmail}`)
    await axios.post(`${API_URL}/auth/register`, {
      email: custEmail,
      password: 'password123',
      role: 'CUSTOMER',
    })

    // 4. Login Customer
    console.log('[4] Logging in Customer...')
    const custLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: custEmail,
      password: 'password123',
    })
    const custToken = custLoginRes.data.token
    console.log('    Customer Token obtained.')

    // 5. Create Event (Organizer)
    console.log('\n[5] Creating Event (Organizer)...')
    const eventRes = await axios.post(
      `${API_URL}/events`,
      {
        title: 'Tech Conference 2026',
        description: 'The best tech conference ever.',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Virtual',
        totalTickets: 100,
      },
      { headers: { Authorization: `Bearer ${orgToken}` } },
    )
    const eventId = eventRes.data.id
    console.log(`    Event created with ID: ${eventId}`)

    // 6. Book Ticket (Customer)
    console.log('\n[6] Booking Ticket (Customer)...')
    await axios.post(
      `${API_URL}/bookings`,
      {
        eventId,
        ticketsCount: 2,
      },
      { headers: { Authorization: `Bearer ${custToken}` } },
    )
    console.log('    Booking successful! Check console for Email Simulation.')

    // 7. Update Event (Organizer)
    console.log('\n[7] Updating Event (Organizer)...')
    await axios.put(
      `${API_URL}/events/${eventId}`,
      {
        title: 'Tech Conference 2026 - UPDATED',
      },
      { headers: { Authorization: `Bearer ${orgToken}` } },
    )
    console.log('    Event updated! Check console for Notification Simulation.')

    console.log('\n--- Verification Complete ---')
  } catch (error: any) {
    console.error('Verification Failed:', error.response?.data || error.message)
  }
}

runVerification()
