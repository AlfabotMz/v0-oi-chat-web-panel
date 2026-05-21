/**
 * Utilitário centralizado para construção de URLs de webhook do n8n.
 * 
 * Esta função resolve inconsistências entre o que está no .env.local e o que o n8n espera.
 */

type WebhookPath =
    | "api/agents/connect-whatsapp"
    | "api/agents/check-status"
    | "api/agents/create-agent"
    | "api/agents/update-prompt"
    | "api/agents/delete-agent";

/**
 * Mapeia caminhos internos para os caminhos de webhook reais do n8n.
 * Baseado na documentação docs/N8N_CONFIG.md
 */
const PATH_MAP: Record<WebhookPath, string> = {
    "api/agents/connect-whatsapp": "webhook/connect-whatsapp",
    "api/agents/check-status": "webhook/check-status",
    "api/agents/create-agent": "webhook/create-agent",
    "api/agents/update-prompt": "webhook/update-prompt",
    "api/agents/delete-agent": "webhook/delete-agent"
};

export function getWebhookUrl(internalPath: WebhookPath | string): string {
    // 1. Obter a URL base preferindo N8N_WEBHOOK_URL
    // Prioridade: N8N_WEBHOOK_URL > N8N_URL > API_URL
    const envUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL || process.env.API_URL || "https://n8n.myoichat.online";

    console.log(`[WebhookUtils] Usando base de ambiente: ${envUrl}`);

    // 2. Limpar a URL base (remover o sufixo /webhook/ se ele já existir, pois vamos adicionar via PATH_MAP)
    let baseUrl = envUrl;
    if (envUrl.includes("/webhook/")) {
        baseUrl = envUrl.split("/webhook/")[0];
    }

    // Remover barra final se existir
    baseUrl = baseUrl.replace(/\/$/, "");

    // 3. Obter o caminho final do mapeamento ou usar o fornecido
    const finalPath = PATH_MAP[internalPath as WebhookPath] || internalPath;

    // 4. Construir URL final
    const fullUrl = `${baseUrl}/${finalPath}`;

    console.log(`[WebhookUtils] URL final construída: ${fullUrl}`);

    return fullUrl;
}
