"use client";

import { regex } from "@/constants";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Input,
  Link,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { IoIosImages } from "react-icons/io";

import {
  RegisterOptions,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { commerceActions } from "@/actions";
import toast from "react-hot-toast";
import { useBoolean } from "usehooks-ts";
import { CardCommerce } from "./CardCommerce";
import { motion } from "framer-motion";
import { Category, Commerce, DBCommerce } from "@/interfaces";
import { PagePaths } from "@/enums";
import { useCustomSearchParams } from "@/hooks";

export enum FieldsForm {
  NAME = "name",
  URL = "url",
  QUERIES = "queries",
  IMAGE = "image",
  CATEGORIES = "categories",
}
export interface IForm {
  [FieldsForm.NAME]: string;
  [FieldsForm.URL]: string;
  [FieldsForm.QUERIES]: string;
  [FieldsForm.IMAGE]: string;
  [FieldsForm.CATEGORIES]: string[];
}

const validationForm: Record<string, RegisterOptions> = {
  [FieldsForm.NAME]: { required: "El nombre del comercio es requerido" },
  [FieldsForm.URL]: {
    required: "La url del comercio es requerida",
    pattern: {
      value: regex.url,
      message: "El enlace no es válido",
    },
  },
  [FieldsForm.IMAGE]: {
    required: "La imagen del comercio es requerida",
    pattern: {
      value: regex.url,
      message: "El enlace de la imagen no es válido",
    },
  },
};

const handleConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

interface Props {
  commerce?: DBCommerce;
  isEditForm?: boolean;
  categories?: Category[];
}

export const CommerceForm: React.FC<Props> = ({
  commerce,
  isEditForm = false,
  categories,
}) => {
  const {
    value: isLoading,
    setTrue: setIsLoadingTrue,
    setFalse: setIsLoadingFalse,
  } = useBoolean(false);

  const {
    value: created,
    setTrue: setCreatedTrue,
    setFalse: setCreatedFalse,
  } = useBoolean(false);

  const {
    value: isCategoriesForm,
    setTrue: setIsCategoriesFormTrue,
    setFalse: setIsCategoriesFormFalse,
  } = useBoolean(false);


  const [createdCommerceSlug, setCreatedCommerceSlug] = useState<string>("");

  const form = useForm<IForm>({
    defaultValues: commerce
      ? {
          [FieldsForm.NAME]: commerce?.name,
          [FieldsForm.URL]: commerce?.url,
          [FieldsForm.QUERIES]: commerce?.queries || "",
          [FieldsForm.IMAGE]: commerce?.image,
        }
      : {},
  });

  const {
    handleSubmit,
    watch,
    register,
    formState: { isValid, errors },
    control,
  } = form;

  const image = watch(FieldsForm.IMAGE);
  const name = watch(FieldsForm.NAME);
  const url = watch(FieldsForm.URL);
  const queries = watch(FieldsForm.QUERIES);

  // const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
  //   {
  //     control,
  //     name: FieldsForm.CATEGORIES,
  //   }
  // );

  const onSubmitForm: SubmitHandler<IForm> = async (data) => {
    const { categories, ...rest } = data;
    try {
      setIsLoadingTrue();
      // if (isEditForm) {
      //   await commerceActions.editCommerce(commerce?._id!, rest);
      //   toast.success("Comercio editado correctamente");
      //   return;
      // }
      const commerce = await commerceActions.createCommerce(rest);
      toast.success("Comercio creado correctamente");
      setCreatedTrue();
      handleConfetti();
      setCreatedCommerceSlug(commerce.slug);
    } catch (error: any) {
      // if (isEditForm) {
      //   toast.error("Ocurrió un error al editar el comercio: " + error.message);

      //   return;
      // }
      toast.error("Ocurrió un error al crear el comercio: " + error.message);
    } finally {
      setIsLoadingFalse();
    }
  };

  const onSubmitCategoryForm: SubmitHandler<IForm> = async (data) => {};

  useEffect(() => {
    const commerceCategories = categories?.map((e) => ({
      ...e,
      path: commerce?.categories?.find((c) => c.category === e._id)?.path || "",
    }));

    // append(commerceCategories || []);
  }, []);

  return (
    <div className="w-full flex flex-col sm:flex-row gap-2">
      {created && !isCategoriesForm ? (
        <Card className="w-full max-w-[650px] mx-auto">
          <CardHeader className="pb-0 pt-4 px-4 flex-col">
            <h3 className="font-bold text-3xl text-success">
              Comercio creado con éxito 🎉
            </h3>
          </CardHeader>
          <CardBody className="grid gap-4">
            <div className="mx-auto grid place-content-center my-[50px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                  },
                  scale: [1, 1.6, 1.5],
                }}
              >
                <CardCommerce
                  url={url}
                  image={image}
                  name={name}
                  showImage={!!image && !errors[FieldsForm.IMAGE]}
                  validUrl={!url || !!errors[FieldsForm.URL]}
                />
              </motion.div>
            </div>
            <Divider />
            <div className="w-full flex max-md:flex-col gap-2 justify-center">
              <Button as={Link} href={`/${PagePaths.COMMERCES}`}>
                Ver comercios
              </Button>
              <Button
                as={Link}
                href={`/${PagePaths.EDIT_COMMERCE}/${createdCommerceSlug}?addCategories=true`}
              >
                Agregar categorías
              </Button>
              <Button onClick={setCreatedFalse}>Crear otro comercio</Button>
            </div>
          </CardBody>
        </Card>
      ) : isCategoriesForm ? (
        <Card className="w-full max-w-[600px] mx-auto">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h3 className="font-bold text-xl">Agregar categorías</h3>
          </CardHeader>

          <CardBody>
            <Divider />
            <small className="my-2">
              Ingresa las categorías que pertenecen al comercio y el path que
              usan para su url
            </small>

            <form onSubmit={handleSubmit(onSubmitCategoryForm)}>
              <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-2">
                {/* {(fields as any[])?.map((field, index) => (
                  <>
                    <label
                      htmlFor={field.id}
                      className="self-center col-span-1 max-md:mt-2"
                    >
                      {field.name}
                    </label>
                    <Input
                      className="col-span-2"
                      id={field.id}
                      {...register(`${FieldsForm.CATEGORIES}.${index}`)}
                      defaultValue={field.path}
                      placeholder={`path de la categoría ${field.name}...`}
                      // label={field.name}
                      // labelPlacement="outside-left"
                    />
                  </>
                ))} */}
              </div>
              <Divider />

              <Button
                onClick={setIsCategoriesFormFalse}
                className="w-full md:w-auto"
              >
                Volver
              </Button>
              <Button
                type="submit"
                color="success"
                className="w-full md:w-auto"
              >
                Guardar
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : (
        <Card className="w-full max-w-[600px] mx-auto">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h3 className="font-bold text-xl">
              {isEditForm
                ? `Editar comercio: ${commerce?.name}`
                : "Crear comercio"}
            </h3>
          </CardHeader>
          <CardBody>
            <Divider />

            <form
              onSubmit={handleSubmit(onSubmitForm)}
              className="mt-4 grid gap-4"
            >
              <div className="flex gap-4">
                <div className="grid gap-4 flex-1">
                  <Input
                    isRequired
                    type="text"
                    label={"Nombre del comercio"}
                    {...register(
                      FieldsForm.NAME,
                      validationForm[FieldsForm.NAME]
                    )}
                    isInvalid={!!errors[FieldsForm.NAME]}
                    errorMessage={errors[FieldsForm.NAME]?.message}
                    value={name}
                  />
                  <Input
                    isRequired
                    type="url"
                    label={"Página del comercio"}
                    {...register(
                      FieldsForm.URL,
                      validationForm[FieldsForm.URL]
                    )}
                    isInvalid={!!errors[FieldsForm.URL]}
                    errorMessage={errors[FieldsForm.URL]?.message}
                    value={url}
                  />

                  <Input
                    isRequired
                    type="url"
                    label={"Logo del comercio"}
                    {...register(
                      FieldsForm.IMAGE,
                      validationForm[FieldsForm.IMAGE]
                    )}
                    isInvalid={!!errors[FieldsForm.IMAGE]}
                    errorMessage={errors[FieldsForm.IMAGE]?.message}
                    value={image}
                  />
                </div>

                <div className="hidden md:block">
                  <CardCommerce
                    url={url}
                    image={image}
                    name={name}
                    showImage={!!image && !errors[FieldsForm.IMAGE]}
                    validUrl={!url || !!errors[FieldsForm.URL]}
                  />
                </div>
              </div>

              <Input
                type="text"
                label={"Queries (opcional)"}
                {...register(
                  FieldsForm.QUERIES,
                  validationForm[FieldsForm.QUERIES]
                )}
                isInvalid={!!errors[FieldsForm.QUERIES]}
                errorMessage={errors[FieldsForm.QUERIES]?.message}
                description={
                  "Ingresa las queries usadas por el comercio para mejorar el ordenamiento y la calidad de data"
                }
                value={queries}
              />

              <Divider />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="success"
                  isDisabled={!isValid || isLoading}
                  className="w-full md:w-auto"
                >
                  {isEditForm ? "Editar comercio" : "Crear comercio"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
};