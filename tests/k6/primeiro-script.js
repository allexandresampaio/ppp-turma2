import http from 'k6/http';
import { sleep, check } from 'k6';

//define quais as configuracoes do teste
export const options = {
  vus: 1,
  iterations: 1,

};

//o teste de fato
export default function() {
  let res = http.post(
    'http://localhost:3000/instructors/login', 
    JSON.stringify({
        email: "al@le",
        password: "123456"
    }),
    {
        headers: {
            'Content-Type': 'application/json'
        }
    }
  );

  console.log(res.body)
  

  sleep(1);
}
