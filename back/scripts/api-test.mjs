const base = 'http://localhost:8080';

async function run(){
  try{
    console.log('1) Registering...');
    let res = await fetch(`${base}/api/auth/register`, {
      method:'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({firstName:'Test', lastName:'User', email:'test.user.fixed@example.com', password:'Password123'})
    });
    let json = await res.text();
    console.log('Register status', res.status, json);

    console.log('2) Logging in...');
    res = await fetch(`${base}/api/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:'test.user.fixed@example.com', password:'Password123'})
    });
    let text = await res.text();
    let loginJson = null;
    try { loginJson = JSON.parse(text); } catch(e) { /* not JSON */ }
    console.log('Login status', res.status, loginJson ?? text);
    if (!loginJson || !loginJson.token) { console.error('Login did not return token; aborting'); return; }
    const token = loginJson.token;

    console.log('3) GET /api/users/me');
    res = await fetch(`${base}/api/users/me`, {headers: {Authorization: `Bearer ${token}`}});
    text = await res.text();
    let meJson = null; try { meJson = JSON.parse(text); } catch(e) { }
    console.log('Me status', res.status, meJson ?? text);
    const id = meJson?.id;
    if (!id) { console.error('Cannot determine user id; aborting'); return; }

    console.log('4) Updating profile');
    res = await fetch(`${base}/api/users/${id}`, {
      method:'PUT', headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({firstName:'Updated', lastName:'User', phone:'123456789', photoUrl:'http://example.com/photo.jpg', bio:'Hello'})
    });
    text = await res.text();
    let updJson = null; try { updJson = JSON.parse(text); } catch(e) { }
    console.log('Update status', res.status, updJson ?? text);

    console.log('5) Change password');
    res = await fetch(`${base}/api/users/${id}/change-password`, {
      method:'POST', headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({currentPassword:'Password123', newPassword:'NewPass123'})
    });
    console.log('Change-password status', res.status, await res.text());

  } catch(e){
    console.error('Error', e);
  }
}

run();
