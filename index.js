const fs = require('fs');
const readlineSync = require('readline-sync');

const DATA_FILE = 'clinica_data.json';

let data;
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE));
} else {
  data = {
    pacientes: [],
    agendamentos: []
  };
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function cadastrarPaciente() {
  const nome = readlineSync.question('Nome do paciente: ');
  const telefone = readlineSync.question('Telefone do paciente: ');

  const pacienteExistente = data.pacientes.find(paciente => paciente.telefone === telefone);
  if (pacienteExistente) {
    console.log('Paciente já cadastrado!');
    return;
  }

  const novoPaciente = {
    id: data.pacientes.length + 1,
    nome: nome,
    telefone: telefone
  };
  data.pacientes.push(novoPaciente);
  saveData();
  console.log('Paciente cadastrado com sucesso');
}

function listarPacientes() {
  if (data.pacientes.length === 0) {
    console.log('Nenhum paciente cadastrado.');
    return;
  }

  for (let i = 0; i < data.pacientes.length; i++) {
    console.log(`${data.pacientes[i].id}. ${data.pacientes[i].nome} - ${data.pacientes[i].telefone}`)
  }
}

function listarConsultas() {
  if (data.agendamentos.length === 0) {
    console.log('Nenhuma consulta agendada.');
    return;
  }

  for (let i = 0; i < data.agendamentos.length; i++) {
    const paciente = data.pacientes.find((p) => p.id === data.agendamentos[i].pacienteId);
    console.log(`${paciente.id}. ${paciente.nome} - ${data.agendamentos[i].dia} ${data.agendamentos[i].hora} - ${data.agendamentos[i].especialidade}`);
  }
}

function marcarConsulta() {
  listarPacientes();

  const pacienteIdx = readlineSync.questionInt('Escolha o número do paciente: ') - 1;

  if (pacienteIdx < 0 || pacienteIdx >= data.pacientes.length) {
    console.log('Paciente inválido!');
    return;
  }


  const pacienteId = data.pacientes[pacienteIdx].id;
  const dia = readlineSync.question('Dia da consulta (YYYY-MM-DD): ');
  const hora = readlineSync.question('Hora da consulta (HH:MM): ');
  const especialidade = readlineSync.question('Especialidade da consulta: ');

  const consultaDateTime = new Date(`${dia}T${hora}:00`);
  if (consultaDateTime < new Date()) {
    console.log('Não é possível agendar consultas retroativas.');
    return;
  }

  const conflitoEntreDatas = data.agendamentos.some((arg) => arg.dia === dia && arg.hora === hora);
  if (conflitoEntreDatas) {
    console.log('Horário já agendado.');
    return;
  }

  const novoAgendamento = {
    id: data.agendamentos.length + 1,
    pacienteId: pacienteId,
    dia: dia,
    hora: hora,
    especialidade: especialidade
  };
  data.agendamentos.push(novoAgendamento);
  saveData();
  console.log('Consulta marcada com sucesso');
}

function cancelarConsulta() {
  listarConsultas();
  const consultaIdx = readlineSync.questionInt('Escolha o número da consulta a cancelar: ') - 1;
  if (consultaIdx < 0 || consultaIdx >= data.agendamentos.length) {
    console.log('Consulta inválida!');
    return;
  }

  const agendamento = data.agendamentos[consultaIdx];
  console.log(`Consulta agendada para ${agendamento.dia} ${agendamento.hora} - ${agendamento.especialidade}`);
  const confirm = readlineSync.question('Deseja realmente cancelar esta consulta? (s/n): ');
  if (confirm.toLowerCase() === 's') {
    data.agendamentos.splice(consultaIdx, 1);
    saveData();
    console.log('Consulta cancelada com sucesso');
  }
}

function menu() {
  while (true) {
    console.log('\nClínica de Consultas Ágil');
    console.log('1. Cadastrar paciente');
    console.log('2. Marcar consulta');
    console.log('3. Cancelar consulta');
    console.log('4. Listar pacientes');
    console.log('5. Listar consultas');
    console.log('6. Sair');

    const escolha = readlineSync.question("Escolha uma opcao: ");

    switch (escolha) {
      case '1':
        cadastrarPaciente();
        break;
      case '2':
        marcarConsulta();
        break;
      case '3':
        cancelarConsulta();
        break;
      case '4':
        listarPacientes();
        break;
      case '5':
        listarConsultas();
        break;
      case '6':
        console.log('Saindo do sistema...');
        process.exit(0);
      default:
        console.log('Opção inválida! Tente novamente.');
    }
  }
}

menu();
