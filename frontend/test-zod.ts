import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  carKm: z.coerce.number({ invalid_type_error: 'Invalid number' }).min(0).max(10000),
});

console.log('Zod safeParse("4"):', schema.safeParse({ carKm: "4" }));
console.log('Zod safeParse(4):', schema.safeParse({ carKm: 4 }));
console.log('Zod safeParse(NaN):', schema.safeParse({ carKm: NaN }));
console.log('Zod safeParse(undefined):', schema.safeParse({ carKm: undefined }));
console.log('Zod safeParse(""):', schema.safeParse({ carKm: "" }));
