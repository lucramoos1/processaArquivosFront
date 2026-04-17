import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function compararPlanilhas(planilhaAtual, planilhaAntiga) {
  const formData = new FormData();
  formData.append('planilhaAtual', planilhaAtual);
  formData.append('planilhaAntiga', planilhaAntiga);

  const response = await axios.post(`${API_URL}/api/csv/compare`, formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const novosNomes = response.headers['x-novos-nomes'];
  const totalNovos = response.headers['x-total-novos'];
  const blob = response.data;

  return { blob, novosNomes, totalNovos };
}
