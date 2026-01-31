import { Code } from "@/components/Code";
import {
  HL,
  List,
  ListItem,
  LNK,
  Note,
  P,
  PGroup,
  Section,
  SectionGroup,
  Title,
} from "@/components/Text";
import React from "react";

const page = () => {
  return (
    <SectionGroup>
      <Section title="Shapes">
        <PGroup>
          <P>In Pacsaz, everything starts with a Shape.</P>
          <P>
            A Shape is the base building block used to generate dielines. Each
            shape internally manages one or more Maker.js models and exposes a
            chainable API to transform them—move, mirror, center, duplicate, and
            so on. <LNK href="">See Utils</LNK>
          </P>
          <P>
            All shapes in Pacsaz inherit from the abstract <HL>Shape</HL> class.
            This means every shape automatically gets a shared set of
            transformation methods without re-implementing them every time.
          </P>
          <P>Think of a Shape as:</P>
          <Note>
            “A drawable object that knows how to position, duplicate, and
            transform itself.”
          </Note>
        </PGroup>

        <PGroup>
          <Title size="sm">Common operations available on all shapes</Title>
          <P>All shapes support methods like:</P>
          <List>
            <ListItem>
              <HL>move(point)</HL> – move the shape relative to its current
              position
            </ListItem>
            <ListItem>
              <HL>mirror(x, y)</HL> – mirror the shape horizontally and/or
              vertically
            </ListItem>
            <ListItem>
              <HL>center()</HL> – center the shape on the canvas
            </ListItem>
            <ListItem>
              <HL>zero()</HL> – reset the shape to the origin
            </ListItem>
            <ListItem>
              <HL>duplicate()</HL> – lone the last model and add it to the shape
            </ListItem>
          </List>

          <P>
            This design makes it easy to build complex dielines step by step,
            without manually managing Maker.js models.
          </P>
        </PGroup>
      </Section>

      <Section title="Line shape">
        <PGroup>
          <P>
            The Line is the simplest shape in Pacsaz and a good place to start.
          </P>
          <P>
            A <HL>Line</HL> represents a straight segment created from two
            points. Internally, it uses Maker.js paths and models, but you never
            have to touch those directly.
          </P>

          <div>
            <Title size="sm">Creating a line</Title>
            <P>A line is created by providing:</P>
          </div>

          <List>
            <ListItem>
              <HL isProp>length</HL> – the length of the line
            </ListItem>
            <ListItem>
              <HL isProp>origin</HL> (optional) – starting point vertically
            </ListItem>
            <ListItem>
              <HL isProp>angle</HL> (optional) – rotation angle (between -180
              and 180)
            </ListItem>
          </List>

          <P>
            Once created, the line is automatically registered as the active
            model of the shape.
          </P>

          <Code code="`const line = new Pacsaz.shapes.Line(length, origin?, angle?); {:ts}`" />
        </PGroup>
      </Section>
    </SectionGroup>
  );
};

export default page;
