import http from 'k6/http';
import { sleep, check } from 'k6';

//define quais as configuracoes do teste
export const options = {
  vus: 1,
  iterations: 1,

};

//os testes de fato
export default function () {

  let responseInstructorRegister = http.post(
    'http://localhost:3000/instructors/register',
    JSON.stringify({
      name: "alle",
      email: "al@le",
      password: "123456"
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

  //console.log(responseInstructorRegister.body)
  sleep(1);

  let responseInstructorLogin = http.post(
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

  check(responseInstructorLogin, {
    'status (login) deve ser igual a 200': (resposta) => resposta.status === 200
  });

  //console.log(responseInstructorLogin.json('token'))
  let tokenInstructorLogin = responseInstructorLogin.json('token')
  sleep(1);

  let responseCreateLesson = http.post(
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