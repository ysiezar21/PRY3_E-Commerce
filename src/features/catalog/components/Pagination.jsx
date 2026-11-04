/**
 * Paginación del catálogo.
 *
 * Sincroniza tres fuentes de estado que pueden cambiar entre sí:
 *   1. Algolia (currentRefinement): la página actual del índice.
 *   2. La URL (?page=N): 1-indexada, para poder compartir enlaces.
 *   3. sessionStorage: recuerda la última página al recargar.
 *
 * El reto es evitar bucles infinitos: cada fuente notifica cambios a
 * las otras, así que se usan refs "bandera" (isUpdatingFromUrl,
 * isUpdatingFromAlgolia, isUserAction) para saber quién inició el
 * cambio y no reaccionar a los ecos.
 */

import { useEffect, useRef, useState } from 'react';
import { usePagination, useStats } from 'react-instantsearch';
import { useSearchParams } from 'react-router-dom';

const Pagination = () => {
  // pages: números de página visibles (con padding: 2 alrededor de la actual)
  // refine: función para cambiar de página en Algolia
  const { pages, currentRefinement, isFirstPage, isLastPage, refine } =
    usePagination({ padding: 2 });
  const { nbPages } = useStats();
  const [searchParams, setSearchParams] = useSearchParams();

  // Se pone a true tras la carga inicial, cuando ya se sincronizaron
  // URL y Algolia. Hasta entonces los efectos no deben escribir en la URL.
  const [isInitialized, setIsInitialized] = useState(false);

  // Banderas para identificar el origen del cambio y evitar bucles:
  const isUpdatingFromUrl = useRef(false);      // la URL inició el cambio
  const isUpdatingFromAlgolia = useRef(false);  // Algolia inició el cambio
  const isUserAction = useRef(false);           // el usuario hizo clic
  const lastRefinement = useRef(currentRefinement); // última página vista
  const initialLoadDone = useRef(false);        // la carga inicial ya corrió

  // La URL usa páginas 1-indexadas (?page=1), Algolia 0-indexado (page 0).
  const urlPageToAlgoliaPage = (urlPage) => {
    if (urlPage === null || urlPage === undefined) return null;
    const pageNum = parseInt(urlPage, 10);
    if (isNaN(pageNum)) return null;
    return pageNum - 1;
  };

  const algoliaPageToUrlPage = (algoliaPage) => {
    return algoliaPage + 1;
  };

  // ===== Efecto 1: carga inicial =====
  // Lee ?page=N o sessionStorage y establece la página inicial en Algolia.
  // Se ejecuta una sola vez (initialLoadDone).
  useEffect(() => {
    if (initialLoadDone.current) return;
    if (nbPages === 0) {
      return;
    }

    const pageParam = searchParams.get('page');

    let targetPage = 0;
    let shouldUpdateUrl = false;

    if (pageParam) {
      // La URL manda: si el número es válido, se usa.
      const algoliaPage = urlPageToAlgoliaPage(pageParam);

      if (algoliaPage !== null && algoliaPage >= 0 && algoliaPage < nbPages) {
        targetPage = algoliaPage;
      } else {
        // Número inválido o fuera de rango: hay que limpiar la URL.
        shouldUpdateUrl = true;
      }
    } else {
      // Sin ?page, intentamos restaurar la última página de la sesión.
      const savedPage = sessionStorage.getItem('last_pagination_page');
      if (savedPage) {
        const savedPageNum = parseInt(savedPage, 10);
        if (!isNaN(savedPageNum) && savedPageNum >= 0 && savedPageNum < nbPages) {
          targetPage = savedPageNum;
          shouldUpdateUrl = true;
        }
      }
    }

    // Si la URL tiene un valor inválido o hay que reflejar sessionStorage,
    // la actualizamos sin recargar la página.
    if (shouldUpdateUrl) {
      const newParams = new URLSearchParams(searchParams);
      if (targetPage > 0) {
        newParams.set('page', algoliaPageToUrlPage(targetPage).toString());
      } else {
        newParams.delete('page');
      }
      setSearchParams(newParams, { replace: true });
    }

    // Aplicamos la página a Algolia. Marcamos isUpdatingFromUrl para que
    // el efecto 2 no interprete este cambio como "Algolia cambió solo".
    isUpdatingFromUrl.current = true;
    refine(targetPage);

    // Esperamos a que Algolia procese antes de liberar las banderas.
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
      initialLoadDone.current = true;
      setIsInitialized(true);
    }, 300);

  }, [nbPages, searchParams, refine, setSearchParams]);

  // ===== Efecto 2: Algolia → URL =====
  // Cuando Algolia cambia de página (por ejemplo, al pulsar un botón),
  // refleja el cambio en la URL con ?page=N.
  useEffect(() => {
    // Ignorar si el cambio vino de la URL, de una acción del usuario,
    // o si aún no terminó la carga inicial.
    if (isUpdatingFromUrl.current) return;
    if (!isInitialized) return;
    if (lastRefinement.current === currentRefinement) return;
    if (isUserAction.current) return;

    lastRefinement.current = currentRefinement;

    const urlPage = algoliaPageToUrlPage(currentRefinement);

    const newParams = new URLSearchParams(searchParams);
    if (currentRefinement > 0) {
      newParams.set('page', urlPage.toString());
    } else {
      newParams.delete('page');
    }

    // Solo escribimos en la URL si realmente cambia, para no disparar
    // renders innecesarios.
    const currentPageParam = searchParams.get('page');
    const newPageStr = currentRefinement > 0 ? urlPage.toString() : null;

    if (currentPageParam !== newPageStr) {
      isUpdatingFromAlgolia.current = true;
      setSearchParams(newParams, { replace: true });
      setTimeout(() => {
        isUpdatingFromAlgolia.current = false;
      }, 100);
    }
  }, [currentRefinement, searchParams, setSearchParams, isInitialized]);

  // ===== Efecto 3: URL → Algolia =====
  // Si el usuario navega con el botón atrás/adelante del navegador,
  // la URL cambia sin que Algolia lo sepa. Este efecto lo sincroniza.
  useEffect(() => {
    if (!isInitialized) return;
    if (isUpdatingFromAlgolia.current) return;
    if (isUpdatingFromUrl.current) return;
    if (isUserAction.current) {
      return;
    }

    const pageParam = searchParams.get('page');

    if (!pageParam) {
      return;
    }

    const targetAlgoliaPage = urlPageToAlgoliaPage(pageParam);

    if (targetAlgoliaPage === null || targetAlgoliaPage < 0 || targetAlgoliaPage >= nbPages) {
      return;
    }

    if (targetAlgoliaPage !== currentRefinement && nbPages > 0) {
      isUpdatingFromUrl.current = true;
      refine(targetAlgoliaPage);
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 300);
    }
  }, [searchParams, currentRefinement, nbPages, refine, isInitialized]);

  // ===== Efecto 4: persistir página actual en sessionStorage =====
  // Permite restaurar la página al recargar o volver desde un detalle.
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem('last_pagination_page', currentRefinement.toString());
    }
  }, [currentRefinement, isInitialized]);

  // Si solo hay una página, no se muestra la paginación.
  if (pages.length <= 1) return null;

  // ===== Handlers =====

  // Click en un número de página.
  const handleRefine = (page) => {
    // Validación defensiva por si llega un valor raro.
    if (isNaN(page) || page < 0 || page >= nbPages) {
      return;
    }
    isUpdatingFromUrl.current = false;
    isUserAction.current = true;
    refine(page);

    // Bloquea los efectos durante 500ms para que no reaccionen al
    // cambio que ya estamos provocando nosotros.
    setTimeout(() => {
      isUserAction.current = false;
    }, 500);
  };

  // Botón "<<": primera página.
  const goToFirstPage = () => {
    if (!isFirstPage) {
      isUpdatingFromUrl.current = false;
      isUpdatingFromAlgolia.current = false;
      isUserAction.current = true;

      const newParams = new URLSearchParams(searchParams);
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });

      refine(0);

      setTimeout(() => {
        isUserAction.current = false;
      }, 500);
    }
  };

  // Botón ">>": última página.
  const goToLastPage = () => {
    if (!isLastPage) {
      isUpdatingFromUrl.current = false;
      isUpdatingFromAlgolia.current = false;
      isUserAction.current = true;
      refine(nbPages - 1);

      setTimeout(() => {
        isUserAction.current = false;
      }, 500);
    }
  };

  return (
    <div className="pagination">
      <button
        disabled={isFirstPage}
        onClick={goToFirstPage}
        className="arrow"
        title="Primera página"
      >
        &lt;&lt;
      </button>

      <button
        disabled={isFirstPage}
        onClick={() => {
          // Flecha "<": página anterior. Mismo patrón que handleRefine.
          isUpdatingFromUrl.current = false;
          isUserAction.current = true;
          refine(currentRefinement - 1);
          setTimeout(() => {
            isUserAction.current = false;
          }, 500);
        }}
        className="arrow"
        title="Página anterior"
      >
        &lt;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handleRefine(page)}
          className={page === currentRefinement ? 'active' : ''}
        >
          {page + 1}
        </button>
      ))}

      <button
        disabled={isLastPage}
        onClick={() => {
          // Flecha ">": página siguiente.
          isUpdatingFromUrl.current = false;
          isUserAction.current = true;
          refine(currentRefinement + 1);
          setTimeout(() => {
            isUserAction.current = false;
          }, 500);
        }}
        className="arrow"
        title="Página siguiente"
      >
        &gt;
      </button>

      <button
        disabled={isLastPage}
        onClick={goToLastPage}
        className="arrow"
        title="Última página"
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;