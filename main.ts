// Fonction pour valider une adresse email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour enregistrer l'adresse email dans un fichier
async function saveEmail(email: string): Promise<boolean> {
    try {
        await Deno.writeTextFile("emails.txt", `${email}\n`, { append: true });
        return true;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'email:", error);
        return false;
    }
}

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

        if (!isValidEmail(email)) {
            return new Response(JSON.stringify({ success: false, message: "Email non valide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const saved = await saveEmail(email);

        if (saved) {
            return new Response(JSON.stringify({ success: true, message: "Email enregistré avec succès" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
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
