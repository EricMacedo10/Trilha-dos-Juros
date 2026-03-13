# 🆘 Guia de Recuperação de Desastre (DNS)

Se o site `trilhadosjuros.com.br` sair do ar subitamente (erro "Site não pode ser acessado" ou `NXDOMAIN`), siga este guia rápido.

## 1. Diagnóstico Rápido
Tente acessar a URL interna da Vercel:
`https://trilha-dos-juros.vercel.app`

*   **Se a URL interna funcionar:** O problema é no DNS (Registro.br).
*   **Se a URL interna NÃO funcionar:** O problema é no servidor ou no código (Vercel).

## 2. Recuperação no Registro.br (Erro de DNS)
Se o problema for no DNS, acesse o painel do [Registro.br](https://registro.br) e verifique se as configurações foram resetadas.

### A Solução "Modo Avançado" (Recomendada)
1.  Clique no botão **Modo Avançado**.
2.  Confirme que deseja gerenciar o DNS pelo Registro.br.
3.  Vá em **Configurar Zona de DNS** e garanta que estas entradas existam:

| Host | Tipo | Valor |
| :--- | :--- | :--- |
| *(vazio)* | **A** | `76.76.21.21` |
| `www` | **CNAME** | `cname.vercel-dns.com` |

4.  Salve as alterações. O site deve voltar em até 2 horas.

## 3. Logs de Segurança (Vercel)
Se o problema for na Vercel, acesse o painel da Vercel e verifique a aba **Logs**. 
*   **DeprecationWarnings** (como `url.parse()`) são normais e **não** derrubam o site.
*   Procure por erros em vermelho (**Error/Crash**).

---
*Este guia foi criado após a incidência de 13/03/2026 para garantir que o conhecimento sênior de recuperação esteja sempre acessível ao usuário.*
