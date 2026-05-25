import type { Denuncia, Usuario } from '@prisma/client';

type DenunciaComAutor = Denuncia & {
  autor?: Pick<Usuario, 'id' | 'nome' | 'email'>;
};

/** Resposta da API — nunca inclui bytes da imagem. */
export type DenunciaPublica = Omit<Denuncia, 'imagemBytes'> & {
  temImagem: boolean;
  imagemUrl: string | null;
};

export function mapDenunciaPublica(d: DenunciaComAutor): DenunciaPublica {
  const { imagemBytes, ...rest } = d;
  const temImagem =
    !!d.imagemMime ||
    (imagemBytes != null && imagemBytes.length > 0) ||
    !!d.imagemUrl;

  return {
    ...rest,
    temImagem,
    imagemUrl: temImagem ? `/denuncias/${d.id}/imagem` : null,
  };
}
