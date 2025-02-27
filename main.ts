import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

// Handler pour la requête HTTP
async function handleRequest(req: Request): Promise<Response> {
    if (req.method === "POST") {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return new Response(JSON.stringify({ success: false, message: "Email invalide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Enregistrer l'email dans Deno KV
        try {
            const kv = await Deno.openKv();
            await kv.set(["emails", Date.now()], email);
            return new Response(JSON.stringify({ success: true, message: "Email enregistré avec succès" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'email:", error);
            return new Response(JSON.stringify({ success: false, message: "Erreur lors de l'enregistrement de l'email" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } else {
        return new Response(JSON.stringify({ success: false, message: "Méthode non autorisée" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Démarrer le serveur
Deno.serve({ port: 8000 }, handleRequest);