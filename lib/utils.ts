import { ZodError } from "zod";

type ErrorDetails = {
	path: string;
	message: string;
};

type DatabaseError = Error & {
	code?: string;
};

export function handleApiError(error: unknown, fallbackMessage: string) {
	if (error instanceof ZodError) {
		const issues: ErrorDetails[] = error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		}));

		return Response.json(
			{
				message: "Validation failed",
				issues,
			},
			{ status: 400 },
		);
	}

	if (error instanceof Error) {
		const databaseError = error as DatabaseError;

		if (databaseError.code === "23505") {
			return Response.json(
				{
					message: fallbackMessage,
				},
				{ status: 409 },
			);
		}

		if (databaseError.code === "23503") {
			return Response.json(
				{
					message: fallbackMessage,
				},
				{ status: 409 },
			);
		}

		return Response.json(
			{
				message: error.message || fallbackMessage,
			},
			{ status: 500 },
		);
	}

	return Response.json({ message: fallbackMessage }, { status: 500 });
}
