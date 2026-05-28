
async function test() {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: 'POST',
    body: JSON.stringify({ email: "admin@eduops.vn", password: "any" }),
    headers: { "Content-Type": "application/json" }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
test();
