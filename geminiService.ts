import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1],
            },
          },
          {
            text: `Edite esta imagem: ${prompt}`,
          },
        ],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

export interface ExtractedBudget {
  clientName?: string;
  serviceDescription?: string;
  budgetAmount?: number;
  date?: string;
  discount?: number;
  requester?: string;
  orderNumber?: string;
}

export const extractBudgetDataFromFiles = async (files: { name: string; url: string; mimeType: string }[]): Promise<ExtractedBudget> => {
  try {
    const modelId = 'gemini-2.5-flash';

    const contentParts: any[] = [];
    
    // Prompt enriquecido com a estrutura da planilha do usuário
    contentParts.push({
      text: `Você é um assistente especializado em orçamentos de engenharia civil (ConstruCost).
      
      CONTEXTO DA PLANILHA MESTRA DO USUÁRIO:
      O usuário mantém uma planilha de controle com as seguintes colunas principais. Tente extrair os dados para preencher exatamente estes campos:
      1. Data (Data do documento/orçamento)
      2. Nome Cliente
      3. Descrição Serviços (Geralmente é o nome do arquivo, ex: "PR0930 rev.01.doc" ou uma descrição técnica como "Adequação Elétrica")
      4. Valor Orçamento (Valor Bruto/Total)
      5. Desconto (Valor monetário do desconto, se houver)
      6. Pedido (Número do PO ou Pedido de Compra, se aprovado)
      7. Solicitante (Engenheiro ou contato responsável)

      INSTRUÇÕES DE EXTRAÇÃO (JSON):
      Retorne APENAS um objeto JSON com os seguintes campos:
      
      - clientName: O nome da empresa cliente (ex: "Construtora X", "Hospital Y").
      - serviceDescription: PREFERÊNCIA: Procure códigos como "PRxxxx", "CC xxxx". Se não achar código, use o título do serviço (ex: "Laudo de Termografia"). Se for confuso, use o nome do arquivo principal limpo.
      - budgetAmount: Valor monetário total da proposta (Number).
      - date: Data encontrada no documento (Format YYYY-MM-DD).
      - requester: Nome de pessoa (Engenheiro/Analista) citado como solicitante ou responsável.
      - orderNumber: Se for um Pedido de Compra (PO), extraia o número (ex: "4500694477", "PO-1234"). Se for apenas um orçamento, deixe null.
      
      - discount: REGRA RÍGIDA:
         - Analise o documento procurando EXPLICITAMENTE por "Desconto", "Abatimento" ou "Dedução".
         - Se não houver linha explícita de desconto com valor negativo ou subtraído, RETORNE 0.
         - Não infira descontos por diferenças de valores.

      Priorize o documento mais recente se houver múltiplos.
      `
    });

    for (const file of files) {
      const base64Data = file.url.split(',')[1];
      
      let mimeType = file.mimeType;
      // Fallback for common types
      if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.endsWith('.png')) mimeType = 'image/png';
      else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) mimeType = 'text/plain';

      contentParts.push({
        text: `Nome do Arquivo: ${file.name}`
      });

      if (['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'].includes(mimeType)) {
         contentParts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: contentParts
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    return JSON.parse(text) as ExtractedBudget;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};