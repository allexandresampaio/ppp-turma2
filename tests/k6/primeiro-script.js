import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { scenario } from 'k6/execution';

// 1. Load the data in the init context using a SharedArray.
// The open() function reads the file once from the local filesystem.
const testData = new SharedArray('users', function () {
  // Parse the JSON data from the file
  return JSON.parse(open('./test-data/users.json'));
});

//define quais as configuracoes do teste
export const options = {
  vus: 100,
  duration: '10s',
  //iterations: 10
  thresholds: {
    http_req_duration: ['p(90)<=50', 'p(95)<=60'], //o percentil de 90 tem que ser <= a 2 milissegundos, percentil de 95 <= 3 milissegundos
    http_req_failed: ['rate<0.01'] //nao queremos nenhum erro
  }
};


//os testes de fato
export default function () {

  // Get a specific data object for the current VU iteration.
  // scenario.iterationInTest is a unique index for each iteration across all VUs.
  const user = testData[scenario.iterationInTest % testData.length];

  const responseInstructorRegister = http.post(
    'http://localhost:3000/instructors/register',
    JSON.stringify({
      name: `${user.name}`,
      email: `${user.email}`,
      password: `${user.password}`
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  check(responseInstructorRegister, {
    'status (create instructor) deve ser igual a 201': (resposta) => resposta.status === 201
  });

  console.log(responseInstructorRegister.body)
  sleep(1);

  const responseInstructorLogin = http.post(
    'http://localhost:3000/instructors/login',
    JSON.stringify({
      email: `${user.email}`,
      password: `${user.password}`
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  check(responseInstructorLogin, {
    'status (login) deve ser igual a 200': (resposta) => resposta.status === 200
  });

  //console.log(responseInstructorLogin.json('token'))
  const tokenInstructorLogin = responseInstructorLogin.json('token')
  sleep(1);

  const responseCreateLesson = http.post(
    'http://localhost:3000/lessons',
    JSON.stringify({
      title: "IA para Testes",
      description: "Aqui aprenderemos como usar IA para potencializar as tarefas de testes."
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInstructorLogin}`
      }
    }
  );
  
  //console.log(responseCreateLesson)

  check(responseCreateLesson, {
    'status (create lesson) deve ser igual a 201': (resposta) => resposta.status === 201
  });
  sleep(1);
 }