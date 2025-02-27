
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}


// Handler pour la requête HTTP
async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url)

    // Route pour POST /emails (ajouter un email)
    if (req.method === "POST" && url.pathname === "/emails") {
        const { email } = await req.json()

        if (!email || typeof email !== "string") {
            return new Response(JSON.stringify({ success: false, message: "Email invalide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        if (!isValidEmail(email)) {
            return new Response(JSON.stringify({ success: false, message: "Email non valide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        // Enregistrer l'email dans Deno KV
        try {
            const kv = await Deno.openKv()
            await kv.set(["emails", Date.now()], email)
            return new Response(JSON.stringify({ success: true, message: "Email enregistré avec succès" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'email:", error)
            return new Response(JSON.stringify({ success: false, message: "Erreur lors de l'enregistrement de l'email" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
    }

    // Route pour DELETE /emails (supprimer un email)
    if (req.method === "DELETE" && url.pathname === "/emails") {
        const { email } = await req.json()

        if (!email || typeof email !== "string") {
            return new Response(JSON.stringify({ success: false, message: "Email invalide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        // Supprimer l'email de Deno KV
        try {
            const kv = await Deno.openKv()
            const entries = kv.list<string>({ prefix: ["emails"] })

            let found = false
            for await (const entry of entries) {
                if (entry.value === email) {
                    await kv.delete(entry.key)
                    found = true
                }
            }

            if (found) {
                return new Response(JSON.stringify({ success: true, message: "Email supprimé avec succès" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            } else {
                return new Response(JSON.stringify({ success: false, message: "Email non trouvé" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                })
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'email:", error)
            return new Response(JSON.stringify({ success: false, message: "Erreur lors de la suppression de l'email" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
    }

    // Route par défaut pour les autres méthodes
    return new Response(JSON.stringify({ success: false, message: "Méthode non autorisée" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    })
}

// Démarrer le serveur
Deno.serve({ port: 8000 }, handleRequest)