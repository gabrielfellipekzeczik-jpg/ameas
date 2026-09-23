-- Expansão do ameas_site_content com novos campos editáveis
-- Fundadora, Organograma, Depoimentos, PIX completo, Voluntário

insert into public.ameas_site_content (key, value) values
  -- Fundadora
  ('founder_name',    'Karina Meneguini'),
  ('founder_bio1',    'Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de superação.'),
  ('founder_bio2',    'À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa.'),
  -- Organograma
  ('org_president_name', 'Karina Meneguini'),
  ('org_vp_name',        'Diretoria Executiva'),
  ('org_sec1_name',      'Secretário(a) Geral'),
  ('org_sec2_name',      'Secretário(a) Adjunto(a)'),
  ('org_treas1_name',    'Tesoureiro(a) Geral'),
  ('org_treas2_name',    'Tesoureiro(a) Adjunto(a)'),
  ('org_audit1_name',    'Fiscal Geral'),
  ('org_audit2_name',    'Fiscal Adjunto(a)'),
  -- Depoimentos
  ('test1_quote',  'A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos.'),
  ('test1_author', 'Família atendida'),
  ('test2_quote',  'Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto.'),
  ('test2_author', 'Parceiro institucional'),
  ('test3_quote',  'Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas.'),
  ('test3_author', 'Atleta AMEAS'),
  -- PIX completo
  ('pix_bank',    'Banco do Brasil'),
  ('pix_agency',  '0523-1'),
  ('pix_account', '48681-7'),
  -- Voluntário
  ('volunteer_title', 'Seja Voluntário(a)'),
  ('volunteer_desc',  'Venha fazer parte da AMEAS! Precisamos de voluntários para apoiar treinos, eventos, atividades administrativas e muito mais. Cada hora doada transforma vidas.')
on conflict (key) do nothing;
