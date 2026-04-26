import { AniListClient } from "ani-client";

const client = new AniListClient();

export interface TreeData {
  rootCharacter: any;
  voiceActor: any;
  otherRoles: any[];
}

export async function searchCharacters(query: string) {
  const results = await client.searchCharacters({
    query,
    perPage: 10,
  });
  return results.results;
}

export async function fetchSeiyuuTree(characterId: number): Promise<TreeData> {
  const character = await client.getCharacter(characterId, {
    voiceActors: true,
  });

  let voiceActor = null;
  if (character.media?.edges) {
    for (const edge of character.media.edges) {
      voiceActor = edge.voiceActors?.find((va: any) => va.languageV2 === "Japanese");
      if (voiceActor) break;
    }
  }

  if (!voiceActor) {
    throw new Error("No Japanese voice actor found for this character.");
  }

  const staffQuery = `
    query ($id: Int) {
      Staff(id: $id) {
        id
        name {
          full
          native
          userPreferred
        }
        image {
          large
        }
        description
        gender
        homeTown
        primaryOccupations
        characterMedia(sort: POPULARITY_DESC, perPage: 15) {
          edges {
            characterRole
            node {
              id
              title {
                romaji
                english
                userPreferred
              }
              coverImage {
                large
              }
            }
            characters {
              id
              name {
                full
                native
                userPreferred
              }
              image {
                medium
              }
            }
          }
        }
      }
    }
  `;

  const staffData = await client.raw<any>(staffQuery, { id: voiceActor.id });
  const staff = staffData.Staff;

  const otherRoles = staff.characterMedia.edges
    .filter((edge: any) => {
      return !edge.characters.some((c: any) => c.id === characterId);
    })
    .map((edge: any) => ({
      anime: edge.node,
      character: edge.characters[0],
      role: edge.characterRole,
    }));

  const rootMedia = character.media?.edges?.slice(0, 6).map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    coverImage: edge.node.coverImage
  }));

  return {
    rootCharacter: { ...character, media: rootMedia },
    voiceActor: staff,
    otherRoles,
  };
}
