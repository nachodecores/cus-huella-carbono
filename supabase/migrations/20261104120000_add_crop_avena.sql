INSERT INTO public.crops (label)
VALUES ('Avena')
ON CONFLICT (label) DO NOTHING;