import { serialiseJsonLd } from "@/lib/seo/schema";

/**
 * Inlines a JSON-LD graph.
 *
 * Lives in its own component so the escaping in `serialiseJsonLd` cannot be
 * forgotten: a dieline title containing `</script>` would otherwise close this
 * tag early and dump the rest of the graph into the document as markup.
 *
 * `@context` is required — a node without it is ignored by every consumer.
 */
const JsonLd = ({ data }: { data: object | object[] }) => (
  <script
    type="application/ld+json"
    // The JSON is escaped for the `<script>` context; see `serialiseJsonLd`.
    dangerouslySetInnerHTML={{ __html: serialiseJsonLd(data) }}
  />
);

export default JsonLd;
