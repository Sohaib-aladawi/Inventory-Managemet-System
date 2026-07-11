import { ZodError } from "zod";

type ErrorDetails = {
	path: string;
	message: string;
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
		return Response.json(
			{
				message: error.message || fallbackMessage,
			},
			{ status: 500 },
		);
	}

	return Response.json({ message: fallbackMessage }, { status: 500 });
}
